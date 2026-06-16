<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RadAcct;
use App\Models\RadPostAuth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MonitorApiController extends Controller
{
    public function sessions(Request $request): JsonResponse
    {
        $sessions = RadAcct::query()
            ->whereNull('acctstoptime')
            ->when($request->search, fn ($q, $s) => $q->where('username', 'like', "%{$s}%"))
            ->orderByDesc('acctstarttime')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (RadAcct $r) => [
                'id' => $r->radacctid,
                'username' => $r->username,
                'nasipaddress' => $r->nasipaddress,
                'framedipaddress' => $r->framedipaddress,
                'callingstationid' => $r->callingstationid,
                'acctstarttime' => optional($r->acctstarttime)->toDateTimeString(),
                'mb_in' => round(($r->acctinputoctets ?? 0) / 1048576, 1),
                'mb_out' => round(($r->acctoutputoctets ?? 0) / 1048576, 1),
            ]);

        $onlineCount = RadAcct::whereNull('acctstoptime')->count();

        return response()->json([
            'sessions' => $sessions,
            'online' => $onlineCount
        ]);
    }

    public function logs(Request $request): JsonResponse
    {
        $logs = RadPostAuth::query()
            ->when($request->search, fn ($q, $s) => $q->where('username', 'like', "%{$s}%"))
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (RadPostAuth $r) => [
                'id' => $r->id,
                'username' => $r->username,
                'reply' => $r->reply,
                'authdate' => optional($r->authdate)->toDateTimeString(),
            ]);

        return response()->json([
            'logs' => $logs
        ]);
    }
}
