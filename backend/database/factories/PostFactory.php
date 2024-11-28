<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->sentence();
        $htmlContents = [
            '<p>The Nike Air Max has been a cultural icon since its debut in 1987. <strong>Featuring revolutionary Air cushioning technology</strong>, these shoes have transformed both athletic performance and street style.</p>
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff" alt="Nike Shoes" />
            <p>The transparent Air unit in the heel not only provides exceptional comfort but also creates a distinctive aesthetic that has stood the test of time.</p>',

            '<h2>Sustainable Fashion: The Future of Footwear</h2>
            <p>As environmental consciousness grows, shoe manufacturers are innovating with eco-friendly materials.</p>
            <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa" alt="Sustainable Shoes" />
            <p>From recycled ocean plastics to plant-based leather alternatives, the industry is stepping towards a greener future.</p>',

            '<h2>How to Care for Your Leather Shoes</h2>
            <p>Proper maintenance can extend the life of your favorite leather shoes significantly.</p>
            <img src="https://images.unsplash.com/photo-1449505278894-297fdb3edbc1" alt="Leather Care" />
            <ul>
                <li>Clean regularly with a soft brush</li>
                <li>Use quality leather conditioner</li>
                <li>Store in a cool, dry place</li>
            </ul>',

            '<h2>The Rise of Sneaker Culture</h2>
            <p>From basketball courts to high fashion runways, sneakers have become a global phenomenon.</p>
            <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a" alt="Sneaker Collection" />
            <p>Limited editions and collaborations have transformed sneakers into coveted collectibles.</p>'
        ];

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => $this->faker->randomElement($htmlContents),
            'image' => $this->faker->imageUrl(800, 600, 'shoes'),
            'category_id' => rand(1, 10),
            'author_id' => rand(1, 5),
            'slug' => Str::slug($title),
            'scheduled_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'published_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
