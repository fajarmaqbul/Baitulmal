<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Sedekah;
use Illuminate\Http\Request;

use App\Services\WhatsAppService;

class SedekahController extends Controller
{
    protected $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index(Request $request)
    {
        $query = Sedekah::with(['rt', 'amil']);

        if ($request->has('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        if ($request->has('rt_id')) {
            $query->where('rt_id', $request->rt_id);
        }

        if ($request->has('rt_kode')) {
            $query->whereHas('rt', function($q) use ($request) {
                $q->where('kode', $request->rt_kode);
            });
        }

        $query->latest('tanggal');

        return response()->json($query->paginate($request->get('per_page', 1000)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amil_id' => 'nullable|exists:asnaf,id',
            'rt_id' => 'nullable|exists:rts,id',
            'rt_kode' => 'nullable|string|max:2', // Added for robustness
            'jumlah' => 'required|numeric',
            'jenis' => 'required|in:penerimaan,penyaluran',
            'tujuan' => 'required|string',
            'tanggal' => 'required|date',
            'tahun' => 'required|integer',
            'nama_donatur' => 'nullable|string',
            'no_hp_donatur' => 'nullable|string',
        ]);

        // Resolve RT ID if kode is provided but ID is missing
        if (empty($validated['rt_id']) && !empty($validated['rt_kode'])) {
            $rt = \App\Models\RT::where('kode', $validated['rt_kode'])->first();
            if ($rt) {
                $validated['rt_id'] = $rt->id;
            }
        }

        $sedekah = Sedekah::create($validated);

        // Send WhatsApp Notification
        if ($sedekah->jenis === 'penerimaan' && $sedekah->no_hp_donatur) {
            $message = "Terima kasih Bpk/Ibu *" . ($sedekah->nama_donatur ?? 'Hamba Allah') . "*\n\n";
            $message .= "Kami telah menerima donasi Anda sebesar *Rp " . number_format($sedekah->jumlah, 0, ',', '.') . "*\n";
            $message .= "Semoga Allah membalas kebaikan Anda dengan pahala yang berlipat ganda. Aamiin.\n\n";
            $message .= "_Baitulmal Masjid_";

            $this->whatsAppService->send($sedekah->no_hp_donatur, $message);
        }

        return response()->json([
            'message' => 'Sedekah recorded successfully',
            'data' => $sedekah->load(['rt', 'amil'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $sedekah = Sedekah::findOrFail($id);
        $validated = $request->validate([
            'amil_id' => 'sometimes|nullable|exists:asnaf,id',
            'rt_id' => 'sometimes|nullable|exists:rts,id',
            'jumlah' => 'sometimes|required|numeric',
            'jenis' => 'sometimes|required|in:penerimaan,penyaluran',
            'tujuan' => 'sometimes|required|string',
            'tanggal' => 'sometimes|required|date',
            'tahun' => 'sometimes|required|integer',
            'nama_donatur' => 'sometimes|nullable|string',
            'no_hp_donatur' => 'sometimes|nullable|string',
        ]);

        $sedekah->update($validated);

        return response()->json([
            'message' => 'Sedekah updated successfully',
            'data' => $sedekah->load(['rt', 'amil'])
        ]);
    }

    public function destroy($id)
    {
        $sedekah = Sedekah::findOrFail($id);
        $sedekah->delete();
        return response()->json(['message' => 'Sedekah deleted successfully']);
    }

    public function summary(Request $request)
    {
        $query = Sedekah::query();
        
        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        if ($request->has('rt_id')) {
            $query->where('rt_id', $request->rt_id);
        }

        $penerimaan = (clone $query)->where('jenis', 'penerimaan')->sum('jumlah');
        $penyaluran = (clone $query)->where('jenis', 'penyaluran')->sum('jumlah');
        $count = $query->count();

        // Detailed breakdown by RT
        $breakdownByRT = \App\Models\RT::all()->map(function($rt) use ($request) {
            $rtQuery = Sedekah::where('rt_id', $rt->id)->where('jenis', 'penerimaan');
            if ($request->has('tahun')) {
                $rtQuery->where('tahun', $request->tahun);
            }
            
            return [
                'rt_id' => $rt->id,
                'rt_kode' => $rt->kode,
                'total_nominal' => (float) $rtQuery->sum('jumlah'),
                'transaction_count' => $rtQuery->count(),
                'last_transaction' => $rtQuery->latest('tanggal')->first()?->tanggal?->toDateString()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'grand_total' => (float) $penerimaan,
                'total_expense' => (float) $penyaluran,
                'net_balance' => (float) ($penerimaan - $penyaluran),
                'total_transaksi' => $count,
                'breakdown' => $breakdownByRT
            ]
        ]);
    }
}
