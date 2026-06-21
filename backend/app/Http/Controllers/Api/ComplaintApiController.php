<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintRemark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComplaintApiController extends Controller
{
    /**
     * Display a listing of complaints.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Complaint::query();

        // Customer can only view their own complaints
        if (Auth::guard('customer-api')->check()) {
            $customer = Auth::guard('customer-api')->user();
            $query->where('customerusername', $customer->username);
        } else {
            // Staff can filter by username, category, status
            if ($request->filled('username')) {
                $query->where('customerusername', $request->username);
            }
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }
        }

        $complaints = $query->orderBy('complaintNumber', 'desc')->paginate(15);

        return response()->json($complaints);
    }

    /**
     * Store a newly created complaint.
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'category' => 'required|string',
            'subcategory' => 'required|string',
            'complaintType' => 'required|string',
            'state' => 'required|string',
            'complaintDetails' => 'required|string',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
        ];

        // If staff logs a complaint, customerusername is required
        if (Auth::guard('sanctum')->check()) {
            $rules['customerusername'] = 'required|string|exists:tbl_customers,username';
        }

        $data = $request->validate($rules);

        $complaint = new Complaint();
        $complaint->category = $data['category'];
        $complaint->subcategory = $data['subcategory'];
        $complaint->complaintType = $data['complaintType'];
        $complaint->state = $data['state'];
        $complaint->complaintDetails = $data['complaintDetails'];
        $complaint->noc = $request->input('noc', '');
        $complaint->status = 'Open';
        $complaint->regDate = now();
        $complaint->lastUpdationDate = now();

        // Determine user context
        if (Auth::guard('customer-api')->check()) {
            $customer = Auth::guard('customer-api')->user();
            $complaint->customerusername = $customer->username;
            $complaint->registeredBy = 'Customer';
        } else {
            $user = Auth::guard('sanctum')->user();
            $complaint->customerusername = $data['customerusername'];
            $complaint->registeredBy = $user->username;
        }

        // File upload
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('complaint_files', 'public');
            $complaint->complaintFile = $path;
        }

        $complaint->save();

        // Create initial remark
        ComplaintRemark::create([
            'complaintNumber' => $complaint->complaintNumber,
            'status' => 'Open',
            'remark' => 'Complaint registered successfully.',
            'remarkDate' => now(),
        ]);

        return response()->json([
            'message' => 'Complaint created successfully.',
            'complaint' => $complaint,
        ], 210); // 210 for created
    }

    /**
     * Display the specified complaint with remarks.
     */
    public function show(int $id): JsonResponse
    {
        $complaint = Complaint::with('remarks')->find($id);

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        // Customer can only view their own
        if (Auth::guard('customer-api')->check()) {
            $customer = Auth::guard('customer-api')->user();
            if ($complaint->customerusername !== $customer->username) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json($complaint);
    }

    /**
     * Update the complaint status (Staff only).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $complaint = Complaint::find($id);

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        // Only staff can update status/remarks
        if (! Auth::guard('sanctum')->check()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'status' => 'required|string|in:Open,In Process,Closed',
            'remark' => 'required|string',
        ]);

        $complaint->status = $data['status'];
        $complaint->lastUpdationDate = now();
        $complaint->save();

        // Add remark
        ComplaintRemark::create([
            'complaintNumber' => $complaint->complaintNumber,
            'status' => $data['status'],
            'remark' => $data['remark'],
            'remarkDate' => now(),
        ]);

        return response()->json([
            'message' => 'Complaint status updated successfully.',
            'complaint' => $complaint,
        ]);
    }
}
