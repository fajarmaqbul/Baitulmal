<?php

namespace App\Http\Controllers\ApiControllers;

use App\Http\Controllers\Controller;
use App\Models\Signer;
use App\Models\SignatureRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SignatureController extends Controller
{
    // --- Master Signers ---

    public function getSigners()
    {
        $signers = Signer::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $signers]);
    }

    public function createSigner(Request $request)
    {
        $validated = $request->validate([
            'nama_pejabat' => 'required|string',
            'jabatan' => 'required|string',
            'nip' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $signer = Signer::create($validated);
        return response()->json(['success' => true, 'data' => $signer]);
    }

    public function updateSigner(Request $request, $id)
    {
        $signer = Signer::find($id);
        if (!$signer) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $validated = $request->validate([
            'nama_pejabat' => 'string',
            'jabatan' => 'string',
            'nip' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $signer->update($validated);
        return response()->json(['success' => true, 'data' => $signer]);
    }

    public function deleteSigner($id)
    {
        $signer = Signer::find($id);
        if (!$signer) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $signer->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }

    // --- Rules ---

    public function getRules()
    {
        $rules = SignatureRule::with(['leftSigner', 'rightSigner'])
            ->orderBy('priority', 'desc') // Higher priority first
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $rules]);
    }

    public function createRule(Request $request)
    {
        $validated = $request->validate([
            'page_name' => 'required|string',
            'category_filter' => 'required|string',
            'rt_filter' => 'required|string',
            'left_signer_id' => 'nullable|exists:signers,id',
            'right_signer_id' => 'nullable|exists:signers,id',
            'priority' => 'integer'
        ]);

        $rule = SignatureRule::create($validated);
        // Load relations
        $rule->load(['leftSigner', 'rightSigner']);
        return response()->json(['success' => true, 'data' => $rule]);
    }

    public function updateRule(Request $request, $id)
    {
        $rule = SignatureRule::find($id);
        if (!$rule) return response()->json(['success' => false, 'message' => 'Not found'], 404);

        $validated = $request->validate([
            'page_name' => 'string',
            'category_filter' => 'string',
            'rt_filter' => 'string',
            'left_signer_id' => 'nullable|exists:signers,id',
            'right_signer_id' => 'nullable|exists:signers,id',
            'priority' => 'integer'
        ]);

        $rule->update($validated);
        // Load relations
        $rule->load(['leftSigner', 'rightSigner']);
        return response()->json(['success' => true, 'data' => $rule]);
    }

    public function deleteRule($id)
    {
        $rule = SignatureRule::find($id);
        if (!$rule) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $rule->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }

    // --- Resolution Logic ---

    public function resolveSignature(Request $request)
    {
        $page = $request->input('page');
        $category = $request->input('category', 'ALL');
        $rt = $request->input('rt', 'ALL');

        // Logic: Find best match
        // Priority 1: Exact match Page + Category + RT
        // Priority 2: Page + Category + ALL RT
        // Priority 3: Page + ALL Category + RT
        // Priority 4: Page + ALL Category + ALL RT

        // We can fetch all rules for the page and filter in PHP or do a smart query
        // Let's rely on Query builder sorting by specificity

        $rules = SignatureRule::where('page_name', $page)
            ->with(['leftSigner', 'rightSigner'])
            ->orderBy('priority', 'desc') // Manual override priority first
            ->get();

        $bestMatch = null;
        $matchScore = -1;

        foreach ($rules as $rule) {
            $currentScore = 0;

            // Check Category
            if ($rule->category_filter === 'ALL') {
                $currentScore += 1; // Generic match
            } elseif ($rule->category_filter === $category) {
                $currentScore += 10; // Exact match
            } else {
                continue; // Mismatch
            }

            // Check RT
            if ($rule->rt_filter === 'ALL') {
                $currentScore += 1; // Generic match
            } elseif ($rule->rt_filter === $rt) {
                $currentScore += 10; // Exact match
            } else {
                continue; // Mismatch
            }

            if ($currentScore > $matchScore) {
                $matchScore = $currentScore;
                $bestMatch = $rule;
            }
        }

        if ($bestMatch) {
            return response()->json([
                'success' => true,
                'data' => [
                    'left' => $bestMatch->leftSigner,
                    'right' => $bestMatch->rightSigner,
                    'rule_id' => $bestMatch->id
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'left' => null,
                'right' => null,
                'message' => 'No matching rule found'
            ]
        ]);
    }
}
