<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PostCategory extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'slug'];

    public function posts()
    {
        return $this->hasMany(Post::class, 'category_id');
    }
    protected static function boot()
    {
        parent::boot();

        // Automatically create slug when creating a new category
        static::creating(function ($category) {
            $category->slug = Str::slug($category->name);
        });

        // Automatically update slug when updating the name
        static::updating(function ($category) {
            if ($category->isDirty('name')) { // Check if 'name' field was changed
                $category->slug = Str::slug($category->name);
            }
        });
    }
}
