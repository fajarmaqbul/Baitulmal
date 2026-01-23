<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Asnaf;
use App\Services\AsnafStatisticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AsnafController extends Controller
{
    protected $statisticsService;

    public function __construct(AsnafStatisticsService $statisticsService)
    {
        $this->statisticsService = $statisticsService;
    }

    /**
     * Display a listing of Asnaf
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Asnaf::with('rt:id,kode,rw');

        // Filters
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->has('rt_id')) {
            $query->where('rt_id', $request->rt_id);
        }

        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'active'); // Default: only active
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $asnaf = $query->paginate($perPage);

        return response()->json($asnaf);
    }

    /**
     * Store a newly created Asnaf
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rt_id' => 'required|exists:rts,id',
            'nama' => 'required|string|max:255',
            'kategori' => 'required|in:Fakir,Miskin,Fisabilillah,Amil',
            'jumlah_jiwa' => 'required|integer|min:1',
            'tahun' => 'required|integer|min:2020|max:2100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'alamat' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $asnaf = Asnaf::create($validated);

        return response()->json([
            'message' => 'Asnaf created successfully',
            'data' => $asnaf->load('rt'),
        ], 201);
    }

    /**
     * Display the specified Asnaf
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $asnaf = Asnaf::with('rt', 'distribusi')->findOrFail($id);

        return response()->json($asnaf);
    }

    /**
     * Update the specified Asnaf
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $asnaf = Asnaf::findOrFail($id);

        $validated = $request->validate([
            'rt_id' => 'sometimes|exists:rts,id',
            'nama' => 'sometimes|string|max:255',
            'kategori' => 'sometimes|in:Fakir,Miskin,Fisabilillah,Amil',
            'jumlah_jiwa' => 'sometimes|integer|min:1',
            'tahun' => 'sometimes|integer|min:2020|max:2100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'alamat' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $asnaf->update($validated);

        return response()->json([
            'message' => 'Asnaf updated successfully',
            'data' => $asnaf->fresh()->load('rt'),
        ]);
    }

    /**
     * Remove the specified Asnaf (soft delete)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $asnaf = Asnaf::findOrFail($id);
        $asnaf->delete();

        return response()->json([
            'message' => 'Asnaf deleted successfully',
        ]);
    }

    /**
     * Get statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $tahun = $request->get('tahun', date('Y'));
        $stats = $this->statisticsService->getOverallSummary($tahun);

        return response()->json($stats);
    }

    /**
     * Get map data for visualization
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function mapData(Request $request): JsonResponse
    {
        $tahun = $request->get('tahun', date('Y'));
        $kategori = $request->get('kategori');
        $rtId = $request->get('rt_id');

        $mapData = $this->statisticsService->getMapData($tahun, $kategori, $rtId);

        return response()->json([
            'total' => count($mapData),
            'data' => $mapData,
        ]);
    }
}
