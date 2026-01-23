<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Person;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    public function index(Request $request)
    {
        $query = Person::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('nama_lengkap')->paginate(20)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'nik' => 'nullable|string|unique:people,nik',
            'no_wa' => 'nullable|string',
        ]);

        $person = Person::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Person created successfully',
            'data' => $person
        ], 201);
    }

    public function show($id)
    {
        $person = Person::with('assignments.structure')->find($id);
        if (!$person) return response()->json(['message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $person]);
    }

    public function update(Request $request, $id)
    {
        $person = Person::find($id);
        if (!$person) return response()->json(['message' => 'Not found'], 404);

        $person->update($request->all());
        return response()->json(['success' => true, 'data' => $person]);
    }

    public function destroy($id)
    {
        $person = Person::find($id);
        if (!$person) return response()->json(['message' => 'Not found'], 404);
        
        $person->delete(); // Soft delete
        return response()->json(['success' => true, 'message' => 'Person deactivated']);
    }
}
