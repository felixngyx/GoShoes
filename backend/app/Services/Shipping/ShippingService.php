<?php

namespace App\Services\Shipping;

use App\Services\ServiceInterfaces\Shipping\ShippingServiceInterface;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Repositories\RepositoryInterfaces\ShippingRepositoryInterface as ShippingRepository;

class ShippingService implements ShippingServiceInterface
{

    private static $shippingRepository;

    public function __construct()
    {
        self::setShippingRepository(app(ShippingRepository::class));
    }

    /**
     * @return mixed
     */
    public static function getShippingRepository(): ShippingRepository
    {
        return self::$shippingRepository;
    }

    /**
     * @param mixed $shippingRepository
     */
    public static function setShippingRepository($shippingRepository): void
    {
        self::$shippingRepository = $shippingRepository;
    }

    public function getListShippingUser() : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = self::getShippingRepository()->getListByUserId($user->id);
        return response()->json([
            'success' => true,
            'data' => [
                $data->makeHidden(self::columnHidden()),
                // is_default: boolean
            ],
        ]);
    }

    public function create(array $request) : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = [
            'user_id' => $user->id,
            'address' => $request['address'],
            'city' => $request['city'],
            'postal_code' => $request['postal_code'],
            'country' => $request['country'],
            'phone_number' => $request['phone_number'],
            'is_default' => $request['is_default'] ?? false,
        ];
        DB::beginTransaction();
        try {

            if ($data['is_default'] == true) {
                $checkDefault = self::checkDefaultExits();
                if ($checkDefault->count() > 0) {
                    foreach ($checkDefault as $item) {
                        $item->update([
                            'is_default' => false,
                        ]);
                    }
                }
            }

            $result = self::getShippingRepository()->create($data);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Create shipping success',
                'data' => $result->makeHidden(self::columnHidden()),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Create shipping fail',
            ]);
        }
    }

    public function update(array $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = [
            'address' => $request['address'] ?? null,
            'city' => $request['city'] ?? null,
            'postal_code' => $request['postal_code'] ?? null,
            'country' => $request['country'] ?? null,
            'phone_number' => $request['phone_number'] ?? null,
            'is_default' => $request['is_default'] ?? false,
        ];

        $data = array_filter($data, function($value) {
            return !is_null($value) && $value !== '';
        });
        DB::beginTransaction();
        try {

            if (self::getShippingRepository()->checkShippingInOrder($request['shipping'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'This shipping is in order',
                ], 400);
            }

            if (!self::checkUserHaveShipping($user->id, $request['shipping'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have this shipping',
                ], 403);
            }

            if ($data['is_default'] == true) {
                $checkDefault = self::checkDefaultExits();
                if ($checkDefault->count() > 0) {
                    foreach ($checkDefault as $item) {
                        $item->update([
                            'is_default' => false,
                        ]);
                    }
                }
            }

            self::getShippingRepository()->update($data, $request['shipping']);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Update shipping success',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Update shipping fail',
            ]);
        }
    }

    public function delete(int $id)
    {
        $user = JWTAuth::parseToken()->authenticate();
        DB::beginTransaction();
        try {

            if (self::getShippingRepository()->checkShippingInOrder($id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This shipping is in order',
                ], 400);
            }

            if (!self::checkUserHaveShipping($user->id, $id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have this shipping',
                ], 403);
            }
            self::getShippingRepository()->forceDelete($id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Delete shipping success',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Delete shipping fail',
            ]);
        }
    }

    private static function checkDefaultExits ()
    {
        return self::getShippingRepository()->checkDefaultExits();
    }

    private static function checkUserHaveShipping(int $userId, int $id)
    {
        return self::getShippingRepository()->getRecordByUserIdAndId($userId, $id);
    }

    private static function checkShippingInOrder(int $id)
    {
        return self::getShippingRepository()->checkShippingInOrder($id);
    }

    private static function columnHidden() : array
    {
        return [
            'id',
            'user_id',
            'created_at',
            'updated_at',
        ];
    }

}
