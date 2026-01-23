<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationStructure;
use Illuminate\Http\Request;

class OrganizationStructureController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => OrganizationStructure::all()
        ]);
    }

    public function store(Request $request)
    {
        // Manually convert empty date strings to null BEFORE validation
        if ($request->has('tanggal_mulai') && $request->input('tanggal_mulai') === '') {
            $request->merge(['tanggal_mulai' => null]);
        }
        if ($request->has('tanggal_selesai') && $request->input('tanggal_selesai') === '') {
            $request->merge(['tanggal_selesai' => null]);
        }

        try {
            $validated = $request->validate([
                'kode_struktur' => 'required|unique:organization_structures,kode_struktur',
                'nama_struktur' => 'required|string',
                'tipe' => 'required|in:Struktural,Kepanitiaan,Project,Event,Panitia',
                'parent_id' => 'nullable|exists:organization_structures,id',
                'tanggal_mulai' => 'nullable|date',
                'tanggal_selesai' => 'nullable|date',
                'is_active' => 'nullable|boolean'
            ]);

            $structure = OrganizationStructure::create($validated);
            return response()->json(['success' => true, 'data' => $structure], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed for structure creation:', [
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    // Additional methods can be added as needed
}
