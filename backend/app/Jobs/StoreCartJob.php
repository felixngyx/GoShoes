<?php
// app/Jobs/StoreCartJob.php
namespace App\Jobs;

use App\Models\Cart;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreCartJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $cartData;

    public function __construct($cartData)
    {
        $this->cartData = $cartData;
    }

    public function handle()
    {
        Cart::updateOrCreate(
            ['user_id' => $this->cartData['user_id'], 'product_id' => $this->cartData['product_id']],
            ['quantity' => DB::raw('quantity + ' . $this->cartData['quantity'])]
        );
    }
}
