<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        // #region agent log
        try {
            // Derive workspace root from Laravel base_path():
            // base_path() = d:\Baitulmall\Baitulmall_API  => workspace = d:\Baitulmall
            $workspaceRoot = \dirname(\base_path());
            $logDir = $workspaceRoot . DIRECTORY_SEPARATOR . '.cursor';
            if (!\is_dir($logDir)) {
                @\mkdir($logDir, 0777, true);
            }
            $logFile = $logDir . DIRECTORY_SEPARATOR . 'debug.log';

            $payload = [
                'sessionId' => 'debug-session',
                'runId' => 'auth-run-1',
                'hypothesisId' => 'H1-H4',
                'location' => 'AuthController@login:entry',
                'message' => 'Login attempt',
                'data' => [
                    'has_email' => $request->filled('email'),
                    'has_password' => $request->filled('password'),
                    'ip' => $request->ip(),
                    'user_agent_present' => $request->header('User-Agent') !== null,
                ],
                'timestamp' => round(microtime(true) * 1000),
            ];
            @file_put_contents($logFile, json_encode($payload) . PHP_EOL, FILE_APPEND);
            Log::info('agent_debug', $payload);
        } catch (\Throwable $e) {
            // swallow logging errors
        }
        // #endregion

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = User::with(['person.assignments.structure'])->where('email', $request['email'])->firstOrFail();

        // #region agent log
        try {
            $workspaceRoot = \dirname(\base_path());
            $logDir = $workspaceRoot . DIRECTORY_SEPARATOR . '.cursor';
            if (!\is_dir($logDir)) {
                @\mkdir($logDir, 0777, true);
            }
            $logFile = $logDir . DIRECTORY_SEPARATOR . 'debug.log';

            $assignments = optional($user->person)->assignments;
            $payload = [
                'sessionId' => 'debug-session',
                'runId' => 'auth-run-1',
                'hypothesisId' => 'H1-H3',
                'location' => 'AuthController@login:loaded_user',
                'message' => 'Loaded user after successful login',
                'data' => [
                    'user_id' => $user->id,
                    'has_person' => $user->relationLoaded('person') && $user->person !== null,
                    'assignment_count' => $assignments ? $assignments->count() : 0,
                    'has_structure_on_first_assignment' => ($assignments && $assignments->first() && $assignments->first()->relationLoaded('structure')),
                ],
                'timestamp' => round(microtime(true) * 1000),
            ];
            @file_put_contents($logFile, json_encode($payload) . PHP_EOL, FILE_APPEND);
            Log::info('agent_debug', $payload);
        } catch (\Throwable $e) {
            // swallow logging errors
        }
        // #endregion

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Get authenticated user details.
     */
    public function user(Request $request)
    {
        $user = $request->user();

        // #region agent log
        try {
            $workspaceRoot = \dirname(\base_path());
            $logDir = $workspaceRoot . DIRECTORY_SEPARATOR . '.cursor';
            if (!\is_dir($logDir)) {
                @\mkdir($logDir, 0777, true);
            }
            $logFile = $logDir . DIRECTORY_SEPARATOR . 'debug.log';

            $payload = [
                'sessionId' => 'debug-session',
                'runId' => 'auth-run-1',
                'hypothesisId' => 'H2-H4',
                'location' => 'AuthController@user:response',
                'message' => 'Auth user endpoint response shape',
                'data' => [
                    'user_id' => $user ? $user->id : null,
                    'has_person_relation' => $user && method_exists($user, 'person'),
                ],
                'timestamp' => round(microtime(true) * 1000),
            ];
            @file_put_contents($logFile, json_encode($payload) . PHP_EOL, FILE_APPEND);
            Log::info('agent_debug', $payload);
        } catch (\Throwable $e) {
            // swallow logging errors
        }
        // #endregion

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
}
