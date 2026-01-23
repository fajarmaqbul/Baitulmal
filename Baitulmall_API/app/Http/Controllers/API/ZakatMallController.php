<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ZakatMall;
use Illuminate\Http\Request;

class ZakatMallController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ZakatMall::with('rt');

        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->has('rt_id')) {
            $query->where('rt_id', $request->rt_id);
        }
        
        // Default sort by latest
        $query->latest('tanggal');

        return response()->json($query->paginate($request->get('per_page', 50)));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rt_id' => 'required|exists:rts,id',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric|min:1000',
            'keterangan' => 'nullable|string',
            'tanggal' => 'nullable|date'
        ]);

        $zakatMall = ZakatMall::create($validated);

        return response()->json([
            'message' => 'Zakat Mall recorded successfully',
            'data' => $zakatMall->load('rt')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $zakatMall = ZakatMall::with('rt')->findOrFail($id);
        return response()->json($zakatMall);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $zakatMall = ZakatMall::findOrFail($id);

        $validated = $request->validate([
            'rt_id' => 'sometimes|exists:rts,id',
            'kategori' => 'sometimes|string',
            'jumlah' => 'sometimes|numeric|min:1000',
            'keterangan' => 'nullable|string',
            'tanggal' => 'nullable|date'
        ]);

        $zakatMall->update($validated);

        return response()->json([
            'message' => 'Zakat Mall updated successfully',
            'data' => $zakatMall->fresh()->load('rt')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $zakatMall = ZakatMall::findOrFail($id);
        $zakatMall->delete();

        return response()->json(['message' => 'Zakat Mall deleted successfully']);
    }
}
