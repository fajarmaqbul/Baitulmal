<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Sedekah;
use Illuminate\Http\Request;

class SedekahController extends Controller
{
    public function index(Request $request)
    {
        $query = Sedekah::with(['rt', 'amil']);

        if ($request->has('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        $query->latest('tanggal');

        return response()->json($query->paginate($request->get('per_page', 50)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amil_id' => 'nullable|exists:asnaf,id',
            'rt_id' => 'nullable|exists:rts,id',
            'jumlah' => 'required|numeric',
            'jenis' => 'required|in:penerimaan,penyaluran',
            'tujuan' => 'required|string',
            'tanggal' => 'required|date',
            'tahun' => 'required|integer',
        ]);

        $sedekah = Sedekah::create($validated);

        return response()->json([
            'message' => 'Sedekah recorded successfully',
            'data' => $sedekah->load(['rt', 'amil'])
        ], 201);
    }

    public function destroy($id)
    {
        $sedekah = Sedekah::findOrFail($id);
        $sedekah->delete();
        return response()->json(['message' => 'Sedekah deleted successfully']);
    }
}
