<?php

namespace App\Jobs;

use App\Models\Wishlist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class StoreWishlistJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private static $wishlistService;

    protected $wishlistData;

    public function __construct($wishlistData)
    {
        $this->wishlistData = $wishlistData;
    }

    public function handle()
    {
        Wishlist::create($this->wishlistData);
    }
}
