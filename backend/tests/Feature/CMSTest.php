<?php

use App\Models\User;
use App\Models\Customer;
use App\Models\Complaint;
use App\Models\ComplaintRemark;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\State;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'user_type' => UserRole::Admin,
        'status' => 'Active'
    ]);

    $this->sales = User::factory()->create([
        'user_type' => UserRole::Sales,
        'status' => 'Active'
    ]);

    $this->customer = Customer::factory()->create([
        'username' => 'cust_cms'
    ]);
});

test('staff can view list of complaints and filter them', function () {
    // Create some complaints
    Complaint::create([
        'customerusername' => 'cust_cms',
        'registeredBy' => $this->admin->username,
        'category' => 'Internet',
        'subcategory' => 'Slow Speed',
        'complaintType' => 'Technical',
        'state' => 'Kathmandu',
        'complaintDetails' => 'Slow internet.',
        'status' => 'Open',
        'regDate' => now(),
        'noc' => '',
    ]);

    Complaint::create([
        'customerusername' => 'other_cust',
        'registeredBy' => $this->sales->username,
        'category' => 'Billing',
        'subcategory' => 'Late Fee',
        'complaintType' => 'Billing',
        'state' => 'Pokhara',
        'complaintDetails' => 'Billing issue.',
        'status' => 'Closed',
        'regDate' => now(),
        'noc' => '',
    ]);

    // Test Admin can see all complaints
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/complaints')
        ->assertStatus(200);

    expect(count($response['data']))->toBe(2);

    // Test filtering by customerusername
    $responseFiltered = $this->actingAs($this->sales, 'sanctum')
        ->getJson('/api/v1/complaints?username=cust_cms')
        ->assertStatus(200);

    expect(count($responseFiltered['data']))->toBe(1);
    expect($responseFiltered['data'][0]['customerusername'])->toBe('cust_cms');

    // Test filtering by status
    $responseStatus = $this->actingAs($this->sales, 'sanctum')
        ->getJson('/api/v1/complaints?status=Closed')
        ->assertStatus(200);

    expect(count($responseStatus['data']))->toBe(1);
    expect($responseStatus['data'][0]['status'])->toBe('Closed');
});

test('staff can create a complaint on behalf of a customer', function () {
    Storage::fake('public');

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/complaints', [
            'customerusername' => 'cust_cms',
            'category' => 'Internet',
            'subcategory' => 'No Connection',
            'complaintType' => 'Technical',
            'state' => 'Kathmandu',
            'complaintDetails' => 'Customer reports absolute disconnect.',
            'file' => UploadedFile::fake()->create('modem_photo.png', 100),
        ])
        ->assertStatus(210);

    expect(Complaint::count())->toBe(1);
    $complaint = Complaint::first();
    expect($complaint->customerusername)->toBe('cust_cms');
    expect($complaint->registeredBy)->toBe($this->admin->username);
    expect($complaint->complaintFile)->not->toBeNull();
    Storage::disk('public')->assertExists($complaint->complaintFile);

    // Initial remark is stored
    expect(ComplaintRemark::count())->toBe(1);
});

test('staff can update complaint status and post remarks', function () {
    $complaint = Complaint::create([
        'customerusername' => 'cust_cms',
        'registeredBy' => $this->sales->username,
        'category' => 'Internet',
        'subcategory' => 'No Connection',
        'complaintType' => 'Technical',
        'state' => 'Kathmandu',
        'complaintDetails' => 'Down.',
        'status' => 'Open',
        'regDate' => now(),
        'noc' => '',
    ]);

    // Update status to In Process
    $response = $this->actingAs($this->sales, 'sanctum')
        ->putJson("/api/v1/complaints/{$complaint->complaintNumber}", [
            'status' => 'In Process',
            'remark' => 'Assigned a technician.',
        ])
        ->assertStatus(200);

    expect($complaint->fresh()->status)->toBe('In Process');
    expect(ComplaintRemark::count())->toBe(1);
    expect(ComplaintRemark::first()->remark)->toBe('Assigned a technician.');
});

test('admin can manage categories and subcategories', function () {
    // 1. Create category
    $resCreate = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/cms/categories', [
            'categoryName' => 'Hardware',
            'categoryDescription' => 'Hardware replacements and issues'
        ])
        ->assertStatus(210);

    $catId = $resCreate['category']['id'];
    expect(Category::count())->toBe(1);

    // 2. Add subcategory
    $resSub = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/cms/subcategories', [
            'categoryid' => $catId,
            'subcategory' => 'Router Replacement'
        ])
        ->assertStatus(210);

    $subId = $resSub['subcategory']['id'];
    expect(Subcategory::count())->toBe(1);

    // 3. Update category
    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/v1/cms/categories/{$catId}", [
            'categoryName' => 'Hardware V2',
            'categoryDescription' => 'Hardware replacements and upgraded issues'
        ])
        ->assertStatus(200);

    expect(Category::first()->categoryName)->toBe('Hardware V2');

    // 4. Delete subcategory
    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/v1/cms/subcategories/{$subId}")
        ->assertStatus(200);

    expect(Subcategory::count())->toBe(0);

    // Add back subcategory to test cascade delete
    $resSub2 = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/cms/subcategories', [
            'categoryid' => $catId,
            'subcategory' => 'Cables'
        ])->assertStatus(210);

    // 5. Delete category
    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/v1/cms/categories/{$catId}")
        ->assertStatus(200);

    expect(Category::count())->toBe(0);
    expect(Subcategory::count())->toBe(0); // verified cascade
});

test('admin can manage states', function () {
    // 1. Create State
    $resCreate = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/cms/states', [
            'stateName' => 'Lalitpur',
            'stateDescription' => 'Lalitpur Operations District'
        ])
        ->assertStatus(210);

    $stateId = $resCreate['state']['id'];
    expect(State::count())->toBe(1);

    // 2. Update State
    $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/v1/cms/states/{$stateId}", [
            'stateName' => 'Lalitpur V2',
            'stateDescription' => 'Lalitpur Operations District Updated'
        ])
        ->assertStatus(200);

    expect(State::first()->stateName)->toBe('Lalitpur V2');

    // 3. Delete State
    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/v1/cms/states/{$stateId}")
        ->assertStatus(200);

    expect(State::count())->toBe(0);
});

test('non-admin staff cannot manage categories or states', function () {
    $category = Category::create([
        'categoryName' => 'Billing',
        'categoryDescription' => 'Billing issues'
    ]);

    $state = State::create([
        'stateName' => 'Bhaktapur',
        'stateDescription' => 'Bhaktapur Operations'
    ]);

    // Sales cannot create category
    $this->actingAs($this->sales, 'sanctum')
        ->postJson('/api/v1/cms/categories', [
            'categoryName' => 'Hardware',
            'categoryDescription' => 'Desc'
        ])->assertStatus(403);

    // Sales cannot update category
    $this->actingAs($this->sales, 'sanctum')
        ->putJson("/api/v1/cms/categories/{$category->id}", [
            'categoryName' => 'Billing Edit',
            'categoryDescription' => 'Billing edit description'
        ])->assertStatus(403);

    // Sales cannot delete category
    $this->actingAs($this->sales, 'sanctum')
        ->deleteJson("/api/v1/cms/categories/{$category->id}")
        ->assertStatus(403);

    // Sales cannot manage states
    $this->actingAs($this->sales, 'sanctum')
        ->postJson('/api/v1/cms/states', [
            'stateName' => 'Pokhara',
            'stateDescription' => 'Pokhara District'
        ])->assertStatus(403);
});
