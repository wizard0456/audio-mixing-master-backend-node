<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;


class CouponController extends Controller
{
    public function index(Request $request):JsonResponse{

        try{
            $perPage = $request->query('per_page', 10);
            $coupons = Coupon::orderBy('id', 'desc')->paginate($perPage);

            if (empty($data)) throw new Exception('No data found', 200);
            return response()->json([$coupons],200);
        }
        catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
    public function show(String $id):JsonResponse{
        try{
            $data = Coupon::where('id', $id)->first();
            if (empty($data)) throw new Exception('No data found', 200);

            return response()->json(['message'=> "success"], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
    public function store(Request $request):JsonResponse{
        try{
            DB::beginTransaction();

            $validator = Validator::make(
                $request->all(),
                [
                    "code" => "required|numeric", 
                    "description" => "required|max:255",
                    "discount_type" => "required|max:255",
                    "discount_value" => "required|numeric",
                    "max_uses" => "required|numeric",
                    "uses" => "required|numeric",
                    "start_date" => "required|date_format",
                    "end_date" => "required|date_format",
                ]);
                if ($validator->fails()) throw new Exception($validator->errors()->first(), 400);
                
                $data = new Coupon();

                $data->code= $request->code;
                $data->description= $request->description;
                $data->discount_type= $request->discount_type;
                $data->discount_value= $request->discount_value;
                $data->max_uses= $request->max_uses;
                $data->uses= $request->uses;
                $data->start_date= $request->start_date;
                $data->end_date= $request->end_date;
                $data->save();

                DB::commit();
                return response()->json(['message'=>"success"],200);
            } catch(Exception $e){

                return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
            }
    }
    public function update(Request $request):JsonResponse{
        try{
            
        } catch(Exception $e){
            return response()->json(['error'=> $e->getMessage()], $e->getCode() ?: 500);
        }
    }
    public function destroy(String $id): JsonResponse
    {
        try {
            $data = Coupon::find($id);
            if (empty($data)) throw new Exception('No data found', 200);

            $data->delete();

            return response()->json('Deleted', 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
}
