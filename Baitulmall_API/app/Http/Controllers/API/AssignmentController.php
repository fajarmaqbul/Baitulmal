<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Assignment::with(['person', 'structure']);

        if ($request->has('structure_id')) {
            $query->where('structure_id', $request->structure_id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'person_id' => 'required|exists:people,id',
                'structure_id' => 'required|exists:organization_structures,id',
                'jabatan' => 'required|string',
                'tanggal_mulai' => 'required|date',
            ]);

            $assignment = Assignment::create($request->all());
            return response()->json(['success' => true, 'data' => $assignment], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) return response()->json(['message' => 'Not found'], 404);

        $assignment->update($request->all());
        return response()->json(['success' => true, 'data' => $assignment]);
    }

    public function destroy($id)
    {
        $assignment = Assignment::find($id);
        if (!$assignment) return response()->json(['message' => 'Not found'], 404);

        $assignment->delete();
        return response()->json(['success' => true, 'message' => 'Assignment deleted']);
    }

    /**
     * Legacy view helper for existing Kepengurusan UI
     * Flattens the assignments for a specific structure (e.g. Baitulmall)
     */
    public function kepengurusanView()
    {
        // Ideally we filter by structure code, e.g. BAITULMALL_2024
        // For now, get all assignments
        $assignments = Assignment::with(['person', 'structure'])->get();

        $flattened = $assignments->map(function($a) {
            return [
                'id' => $a->id, // Use assignment ID, not person ID, for editing context
                'person_id' => $a->person_id,
                'nama' => $a->person->nama_lengkap,
                'jabatan' => $a->jabatan,
                'divisi' => $a->structure->nama_struktur, // Rough mapping
                'alamat' => $a->person->alamat_domisili,
                'no_wa' => $a->person->no_wa,
                'status' => $a->status,
                'periode_mulai' => substr($a->tanggal_mulai, 0, 4),
                'periode_selesai' => $a->tanggal_selesai ? substr($a->tanggal_selesai, 0, 4) : 'Sekarang',
                'job_desk' => $a->keterangan
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $flattened
        ]);
    }
    public function getActiveSigner(Request $request)
    {
        $validated = $request->validate([
            'kode_struktur' => 'required|string', // e.g. BAITULMALL_2023
            'jabatan' => 'required|string',       // e.g. Ketua Umum
        ]);

        $query = Assignment::with(['person', 'structure'])
            ->where('status', 'Aktif')
            ->where(function($q) {
                $q->whereNull('tanggal_selesai')
                  ->orWhere('tanggal_selesai', '>=', now());
            })
            ->whereHas('structure', function($q) use ($request) {
                $q->where('kode_struktur', $request->kode_struktur);
            })
            ->where('jabatan', $request->jabatan);

        // Optional: Filter by Authority (if filter_zakat=true)
        if ($request->has('filter_zakat') && $request->filter_zakat == 'true') {
            $query->where('kewenangan->can_sign_zakat', true);
        }

        $signer = $query->first();

        if (!$signer) {
            return response()->json([
                'success' => false,
                'message' => 'Signer not found or inactive'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'nama_lengkap' => $signer->person->nama_lengkap,
                'jabatan' => $signer->jabatan,
                'structure' => $signer->structure->nama_struktur,
                'no_sk' => $signer->no_sk,
                'person_id' => $signer->person_id
            ]
        ]);
    }
}
