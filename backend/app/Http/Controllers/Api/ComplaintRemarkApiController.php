<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintRemark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComplaintRemarkApiController extends Controller
{
    /**
     * Store a new remark (reply) for a complaint.
     */
    public function store(Request $request, int $complaintId): JsonResponse
    {
        $complaint = Complaint::find($complaintId);

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        // Validate context
        $isCustomer = Auth::guard('customer-api')->check();
        $isStaff = Auth::guard('sanctum')->check();

        if (! $isCustomer && ! $isStaff) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($isCustomer) {
            $customer = Auth::guard('customer-api')->user();
            if ($complaint->customerusername !== $customer->username) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $data = $request->validate([
            'remark' => 'required|string',
            'status' => 'nullable|string|in:Open,In Process,Closed',
        ]);

        // If staff post a remark, they can optionally toggle status
        $status = $complaint->status;
        if ($isStaff && $request->filled('status')) {
            $status = $data['status'];
            $complaint->status = $status;
            $complaint->lastUpdationDate = now();
            $complaint->save();
        }

        $remark = ComplaintRemark::create([
            'complaintNumber' => $complaint->complaintNumber,
            'status' => $status,
            'remark' => $data['remark'],
            'remarkDate' => now(),
        ]);

        return response()->json([
            'message' => 'Remark posted successfully.',
            'remark' => $remark,
            'complaint' => $complaint,
        ], 210);
    }
}
