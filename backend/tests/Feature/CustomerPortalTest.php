<?php

use App\Models\Customer;
use App\Models\Voucher;
use App\Models\Plan;
use App\Models\Bandwidth;
use App\Models\Complaint;
use App\Models\ComplaintRemark;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\State;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    // Setup directory for static pages
    if (!file_exists(resource_path('pages'))) {
        mkdir(resource_path('pages'), 0777, true);
    }
    file_put_contents(resource_path('pages/notice_board.html'), '<p>Notice Board Content</p>');
    file_put_contents(resource_path('pages/order_voucher.html'), '<p>Order Voucher Content</p>');

    // Create required base records
    $this->bw = Bandwidth::create([
        'name' => 'bw_test', 
        'rate_down' => 10, 
        'rate_down_unit' => 'Mbps',
        'rate_up' => 5, 
        'rate_up_unit' => 'Mbps',
    ]);
    
    $this->plan = Plan::create([
        'name' => 'Test Plan', 
        'type' => 'Hotspot', 
        'bandwidth_id' => $this->bw->id,
        'validity' => 30, 
        'validity_unit' => 'Days', 
        'price' => 200,
        'data_usage_gb' => 10, 
        'router_name' => '0',
    ]);
});

afterEach(function () {
    // Clean up temporary pages
    if (file_exists(resource_path('pages/notice_board.html'))) {
        unlink(resource_path('pages/notice_board.html'));
    }
    if (file_exists(resource_path('pages/order_voucher.html'))) {
        unlink(resource_path('pages/order_voucher.html'));
    }
});

test('customer login validation and token retrieval works', function () {
    $customer = Customer::factory()->create([
        'username' => 'cust1',
        'password' => Hash::make('secret123'),
        'fullname' => 'John Customer',
    ]);

    // Test failed login
    $this->postJson('/api/v1/customer/login', [
        'username' => 'cust1',
        'password' => 'wrong_password',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['username']);

    // Test successful login
    $response = $this->postJson('/api/v1/customer/login', [
        'username' => 'cust1',
        'password' => 'secret123',
    ])->assertStatus(200);

    $response->assertJsonStructure([
        'token',
        'customer' => ['id', 'username', 'fullname', 'role'],
    ]);

    expect($response['customer']['username'])->toBe('cust1');
    expect($response['customer']['role'])->toBe('customer');

    // Retrieve token and test 'me' route
    $token = $response['token'];
    $this->getJson('/api/v1/customer/me', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200)
      ->assertJson([
          'username' => 'cust1',
          'role' => 'customer',
      ]);
});

test('customer logout clears the cache token', function () {
    $customer = Customer::factory()->create();
    $tokenObj = $customer->createToken('test-device');
    $token = $tokenObj->plainTextToken;

    // Check we can access me
    $this->getJson('/api/v1/customer/me', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200);

    // Logout
    $this->postJson('/api/v1/customer/logout', [], [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200);

    // Verify token is deleted from cache
    expect(Cache::has("api_token:{$token}"))->toBeFalse();
});

test('customer dashboard returns stats and transactions', function () {
    $customer = Customer::factory()->create(['username' => 'cust_dash']);
    $tokenObj = $customer->createToken('test-device');
    $token = $tokenObj->plainTextToken;

    // Create a mock transaction
    \App\Models\Transaction::create([
        'invoice' => 'INV-TEST101',
        'username' => 'cust_dash',
        'plan_name' => 'Test Plan',
        'price' => '200',
        'recharged_on' => now()->toDateString(),
        'type' => 'Hotspot',
        'time' => '12:00:00',
        'method' => 'Voucher',
        'routers' => '0',
    ]);

    // Insert dummy traffic record in radacct
    DB::table('radacct')->insert([
        'acctsessionid' => 'sess123',
        'acctuniqueid' => 'uniq123',
        'username' => 'cust_dash',
        'acctinputoctets' => 5000,
        'acctoutputoctets' => 15000,
        'acctstarttime' => now(),
        'acctstoptime' => now(),
    ]);

    $response = $this->getJson('/api/v1/customer/dashboard', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200);

    $response->assertJsonStructure([
        'customer',
        'active_recharge',
        'traffic_usage' => ['upload', 'download', 'total'],
        'transactions',
    ]);

    expect($response['traffic_usage']['upload'])->toBe(5000);
    expect($response['traffic_usage']['download'])->toBe(15000);
    expect(count($response['transactions']))->toBe(1);
});

test('customer change password checks current password and updates hash', function () {
    $customer = Customer::factory()->create([
        'password' => Hash::make('old_pass')
    ]);
    $token = $customer->createToken('device')->plainTextToken;

    // Attempt with incorrect current password
    $this->postJson('/api/v1/customer/change-password', [
        'current_password' => 'wrong',
        'new_password' => 'new_pass123',
        'new_password_confirmation' => 'new_pass123',
    ], [
        'Authorization' => "Bearer $token"
    ])->assertStatus(422);

    // Attempt with correct details
    $this->postJson('/api/v1/customer/change-password', [
        'current_password' => 'old_pass',
        'new_password' => 'new_pass123',
        'new_password_confirmation' => 'new_pass123',
    ], [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200);

    expect(Hash::check('new_pass123', $customer->fresh()->password))->toBeTrue();
});

test('customer recharge with valid unused voucher code', function () {
    $customer = Customer::factory()->create(['username' => 'cust_recharge']);
    $token = $customer->createToken('device')->plainTextToken;

    $voucher = Voucher::create([
        'code' => 'VOUCH123',
        'id_plan' => $this->plan->id,
        'status' => '0',
        'expired' => false,
        'routers' => '0',
        'type' => 'Hotspot',
        'user' => '',
        'generated_by' => 'Admin',
    ]);

    $response = $this->postJson('/api/v1/customer/recharge', [
        'code' => 'VOUCH123'
    ], [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200);

    $response->assertJsonStructure(['message', 'recharge']);

    // Check voucher status is updated
    expect($voucher->fresh()->isUsed())->toBeTrue();
    expect($voucher->fresh()->status)->toBe('cust_recharge');

    // Check customer has active recharge
    expect($customer->fresh()->activeRecharge())->not->toBeNull();
});

test('customer custom static pages are served correctly', function () {
    $customer = Customer::factory()->create();
    $token = $customer->createToken('device')->plainTextToken;

    // List pages
    $this->getJson('/api/v1/customer/pages', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200)
      ->assertJsonFragment(['slug' => 'notice_board', 'title' => 'Notice Board'])
      ->assertJsonFragment(['slug' => 'order_voucher', 'title' => 'Order Voucher']);

    // Get specific page content
    $this->getJson('/api/v1/customer/pages/notice_board', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200)
      ->assertJson([
          'slug' => 'notice_board',
          'title' => 'Notice Board',
          'content' => '<p>Notice Board Content</p>'
      ]);

    // Page not found
    $this->getJson('/api/v1/customer/pages/non_existent', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(404);
});

test('customer can create a support ticket with subcategory and state', function () {
    Storage::fake('public');

    $customer = Customer::factory()->create(['username' => 'cust_ticket']);
    $token = $customer->createToken('device')->plainTextToken;

    $category = Category::create(['categoryName' => 'Internet', 'categoryDescription' => 'Internet issue']);
    $sub = Subcategory::create(['categoryid' => $category->id, 'subcategory' => 'Slow Speed']);
    $state = State::create(['stateName' => 'Kathmandu', 'stateDescription' => 'Kathmandu branch']);

    $response = $this->postJson('/api/v1/customer/complaints', [
        'category' => 'Internet',
        'subcategory' => 'Slow Speed',
        'complaintType' => 'Technical',
        'state' => 'Kathmandu',
        'complaintDetails' => 'Slow internet since morning.',
        'file' => UploadedFile::fake()->image('slow_speed.jpg'),
    ], [
        'Authorization' => "Bearer $token"
    ])->assertStatus(210);

    expect(Complaint::count())->toBe(1);
    $complaint = Complaint::first();
    expect($complaint->customerusername)->toBe('cust_ticket');
    expect($complaint->registeredBy)->toBe('Customer');
    expect($complaint->complaintFile)->not->toBeNull();
    Storage::disk('public')->assertExists($complaint->complaintFile);

    // Initial remark was added
    expect(ComplaintRemark::count())->toBe(1);
    expect(ComplaintRemark::first()->complaintNumber)->toBe($complaint->complaintNumber);
});

test('customer can view their tickets and post remarks', function () {
    $customer = Customer::factory()->create(['username' => 'cust_ticket_view']);
    $token = $customer->createToken('device')->plainTextToken;

    // Create a complaint for this user
    $complaint = Complaint::create([
        'customerusername' => 'cust_ticket_view',
        'registeredBy' => 'Customer',
        'category' => 'Internet',
        'subcategory' => 'Slow Speed',
        'complaintType' => 'Technical',
        'state' => 'Kathmandu',
        'complaintDetails' => 'Help me!',
        'status' => 'Open',
        'regDate' => now(),
        'noc' => '',
    ]);

    // Create a complaint for another user to verify isolation
    $otherComplaint = Complaint::create([
        'customerusername' => 'other_user',
        'registeredBy' => 'Customer',
        'category' => 'Billing',
        'subcategory' => 'Late Fee',
        'complaintType' => 'Billing',
        'state' => 'Pokhara',
        'complaintDetails' => 'Wrong invoice details.',
        'status' => 'Open',
        'regDate' => now(),
        'noc' => '',
    ]);

    // Test Index returns only own complaints
    $indexRes = $this->getJson('/api/v1/customer/complaints', [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200);

    expect(count($indexRes['data']))->toBe(1);
    expect($indexRes['data'][0]['customerusername'])->toBe('cust_ticket_view');

    // Test Show complaint details
    $this->getJson("/api/v1/customer/complaints/{$complaint->complaintNumber}", [
        'Authorization' => "Bearer $token"
    ])->assertStatus(200)
      ->assertJsonPath('complaintNumber', $complaint->complaintNumber);

    // Test Show other complaint is forbidden
    $this->getJson("/api/v1/customer/complaints/{$otherComplaint->complaintNumber}", [
        'Authorization' => "Bearer $token"
    ])->assertStatus(403);

    // Test customer can add a remark/comment to their ticket
    $this->postJson("/api/v1/customer/complaints/{$complaint->complaintNumber}/remarks", [
        'remark' => 'Any update?'
    ], [
        'Authorization' => "Bearer $token"
    ])->assertStatus(210);

    expect(ComplaintRemark::where('complaintNumber', $complaint->complaintNumber)->count())->toBe(1);
    expect(ComplaintRemark::where('complaintNumber', $complaint->complaintNumber)->first()->remark)->toBe('Any update?');
});
