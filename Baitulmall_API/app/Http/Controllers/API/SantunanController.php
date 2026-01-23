<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Santunan;
use Illuminate\Http\Request;

class SantunanController extends Controller
{
    public function index(Request $request)
    {
        $query = Santunan::with('rt');

        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        return response()->json($query->paginate($request->get('per_page', 50)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_anak' => 'required|string',
            'rt_id' => 'required|exists:rts,id',
            'besaran' => 'required|numeric',
            'status_penerimaan' => 'required|in:sudah,belum',
            'tanggal_distribusi' => 'nullable|date',
            'tahun' => 'required|integer',
        ]);

        $santunan = Santunan::create($validated);

        return response()->json([
            'message' => 'Santunan record created successfully',
            'data' => $santunan->load('rt')
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $santunan = Santunan::findOrFail($id);
        $validated = $request->validate([
            'nama_anak' => 'sometimes|string',
            'rt_id' => 'sometimes|exists:rts,id',
            'besaran' => 'sometimes|numeric',
            'status_penerimaan' => 'sometimes|in:sudah,belum',
            'tanggal_distribusi' => 'nullable|date',
            'tahun' => 'sometimes|integer',
        ]);

        $santunan->update($validated);
        return response()->json([
            'message' => 'Santunan record updated successfully',
            'data' => $santunan->load('rt')
        ]);
    }

    public function destroy($id)
    {
        $santunan = Santunan::findOrFail($id);
        $santunan->delete();
        return response()->json(['message' => 'Santunan record deleted successfully']);
    }
}
