<?php

namespace App\Http\Controllers;

use App\Models\RadAcct;
use App\Models\RadPostAuth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Live NAS monitoring via the shared FreeRADIUS DB (legacy monitorn.php /
 * monitornas.php). Online sessions = radacct rows with no acctstoptime;
 * auth log = radpostauth.
 */
class MonitorController extends Controller
{
    public function sessions(Request $request): Response
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

        return Inertia::render('Monitor/Sessions', [
            'sessions' => $sessions,
            'online' => RadAcct::whereNull('acctstoptime')->count(),
            'filters' => $request->only('search'),
        ]);
    }

    public function logs(Request $request): Response
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

        return Inertia::render('Monitor/Logs', [
            'logs' => $logs,
            'filters' => $request->only('search'),
        ]);
    }
}
