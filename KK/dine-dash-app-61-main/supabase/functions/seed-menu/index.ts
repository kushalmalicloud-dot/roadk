import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if menu items already exist
    const { count } = await supabaseClient
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ message: 'Menu items already exist', count }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Seed menu items
    const menuItems = [
      // The Road Kitchen Special
      { name: "Veg Pahadi Noodles", category: "special_items", food_type: "veg", price: 200, image_url: "/images/menu/veg-pahadi-noodles.png" },
      { name: "Veg Crunch Roll", category: "special_items", food_type: "veg", price: 200 },
      { name: "Veg Goldie Cutlets", category: "special_items", food_type: "veg", price: 280 },
      { name: "Egg Pahadi Noodles", category: "special_items", food_type: "egg", price: 180 },
      { name: "Chicken Pahadi Noodles", category: "special_items", food_type: "non_veg", price: 240 },
      { name: "Chicken Pahadi Masala Rice", category: "special_items", food_type: "non_veg", price: 260 },
      { name: "Chicken Popcorn Rice", category: "special_items", food_type: "non_veg", price: 250 },
      { name: "Chicken Saathe", category: "special_items", food_type: "non_veg", price: 240 },
      { name: "Chicken Popcorns", category: "special_items", food_type: "non_veg", price: 200 },
      { name: "Chicken Fingers", category: "special_items", food_type: "non_veg", price: 240 },
      { name: "Chicken Haveli", category: "special_items", food_type: "non_veg", price: 260 },
      { name: "Bangkok Chicken", category: "special_items", food_type: "non_veg", price: 300 },
      { name: "Chicken Creamy Bomb", category: "special_items", food_type: "non_veg", price: 320 },
      
      // Veg Starters
      { name: "Vegetable Crispy", category: "starters", food_type: "veg", price: 220 },
      { name: "Paneer Crispy", category: "starters", food_type: "veg", price: 210 },
      { name: "Paneer 65", category: "starters", food_type: "veg", price: 220 },
      { name: "Veg Spring Roll", category: "starters", food_type: "veg", price: 240 },
      { name: "Mix Veg Crispy", category: "starters", food_type: "veg", price: 220 },
      { name: "Hara Bhara Kebab", category: "starters", food_type: "veg", price: 240 },
      { name: "Veg Cheese Tikki", category: "starters", food_type: "veg", price: 210 },
      { name: "Paneer Korean Chilly", category: "starters", food_type: "veg", price: 220 },
      { name: "Veg Manchurian", category: "starters", food_type: "veg", price: 220 },
      { name: "Cheese Ball", category: "starters", food_type: "veg", price: 220 },
      
      // Non-Veg Starters
      { name: "Chicken Crispy", category: "starters", food_type: "non_veg", price: 220 },
      { name: "Chicken Lollypop", category: "starters", food_type: "non_veg", price: 220 },
      { name: "Chicken Schezwan Lollypop", category: "starters", food_type: "non_veg", price: 230 },
      { name: "Chicken Flamingo Lollypop", category: "starters", food_type: "non_veg", price: 250 },
      { name: "Chicken 65", category: "starters", food_type: "non_veg", price: 220 },
      { name: "Chicken Spring Roll", category: "starters", food_type: "non_veg", price: 340 },
      { name: "Chicken Cheese Spring Roll", category: "starters", food_type: "non_veg", price: 380 },
      
      // Soups
      { name: "Manchow Soup (Veg)", category: "soups", food_type: "veg", price: 100 },
      { name: "Manchow Soup (Non-Veg)", category: "soups", food_type: "non_veg", price: 120 },
      { name: "Hot and Sour Soup (Veg)", category: "soups", food_type: "veg", price: 120 },
      { name: "Hot and Sour Soup (Non-Veg)", category: "soups", food_type: "non_veg", price: 130 },
      { name: "Clear Soup (Veg)", category: "soups", food_type: "veg", price: 100 },
      { name: "Clear Soup (Non-Veg)", category: "soups", food_type: "non_veg", price: 120 },
      { name: "Hum Tum Soup (Veg)", category: "soups", food_type: "veg", price: 110 },
      { name: "Hum Tum Soup (Non-Veg)", category: "soups", food_type: "non_veg", price: 120 },
      { name: "Lemon Coriander Soup (Veg)", category: "soups", food_type: "veg", price: 120 },
      { name: "Lemon Coriander Soup (Non-Veg)", category: "soups", food_type: "non_veg", price: 140 },
      
      // Manchurian
      { name: "Veg Manchurian", category: "manchurian", food_type: "veg", price: 170 },
      { name: "Veg Korean Manchurian", category: "manchurian", food_type: "veg", price: 200 },
      { name: "Chicken Manchurian", category: "manchurian", food_type: "non_veg", price: 200 },
      { name: "Chicken Korean Manchurian", category: "manchurian", food_type: "non_veg", price: 220 },
      
      // Chilly Dishes
      { name: "Mix Vegetable Chilly", category: "chilly_dishes", food_type: "veg", price: 260 },
      { name: "Veg Korean Chilly", category: "chilly_dishes", food_type: "veg", price: 190 },
      { name: "Paneer Chilly", category: "chilly_dishes", food_type: "veg", price: 170 },
      { name: "Paneer Korean Chilly", category: "chilly_dishes", food_type: "veg", price: 180 },
      { name: "Veg Honey Chilly Potato", category: "chilly_dishes", food_type: "veg", price: 180 },
      { name: "Veg Honey Chilly Cauliflower", category: "chilly_dishes", food_type: "veg", price: 200 },
      { name: "Chicken Chilly", category: "chilly_dishes", food_type: "non_veg", price: 200 },
      { name: "Chicken Korean Chilly", category: "chilly_dishes", food_type: "non_veg", price: 230 },
      { name: "Lemon Chicken Chilly", category: "chilly_dishes", food_type: "non_veg", price: 200 },
      { name: "Prawns Chilly (APS)", category: "chilly_dishes", food_type: "non_veg", price: 260 },
      
      // Bhel
      { name: "Veg Chinese Bhel", category: "bhel", food_type: "veg", price: 120 },
      { name: "Chicken Chinese Bhel", category: "bhel", food_type: "non_veg", price: 130 },
      
      // Rice
      { name: "Veg Fried Rice", category: "rice", food_type: "veg", price: 160 },
      { name: "Veg Schezwan Fried Rice", category: "rice", food_type: "veg", price: 180 },
      { name: "Veg Triple Rice", category: "rice", food_type: "veg", price: 200 },
      { name: "Veg Chopper Rice", category: "rice", food_type: "veg", price: 200 },
      { name: "Veg Burnt Garlic Rice", category: "rice", food_type: "veg", price: 220 },
      { name: "Veg Hong Kong Rice", category: "rice", food_type: "veg", price: 220 },
      { name: "Veg Manchurian Fried Rice", category: "rice", food_type: "veg", price: 160 },
      { name: "Chicken Fried Rice", category: "rice", food_type: "non_veg", price: 180 },
      { name: "Chicken Schezwan Fried Rice", category: "rice", food_type: "non_veg", price: 200 },
      { name: "Chicken Manchurian Rice", category: "rice", food_type: "non_veg", price: 220 },
      { name: "Chicken Hong Kong Rice", category: "rice", food_type: "non_veg", price: 260 },
      { name: "Chicken Triple Rice", category: "rice", food_type: "non_veg", price: 200 },
      { name: "Chicken Chopper Rice", category: "rice", food_type: "non_veg", price: 220 },
      { name: "Egg Fried Rice", category: "rice", food_type: "egg", price: 140 },
      { name: "Egg Schezwan Fried Rice", category: "rice", food_type: "egg", price: 160 },
      { name: "Egg Burnt Garlic Rice", category: "rice", food_type: "egg", price: 180 },
      { name: "Prawns Fried Rice", category: "rice", food_type: "non_veg", price: 230 },
      { name: "Prawns Schezwan Rice", category: "rice", food_type: "non_veg", price: 250 },
      
      // Noodles
      { name: "Chicken Hakka Noodles", category: "noodles", food_type: "non_veg", price: 190 },
      { name: "Chicken Schezwan Noodles", category: "noodles", food_type: "non_veg", price: 210 },
      { name: "Chicken Hong Kong Noodles", category: "noodles", food_type: "non_veg", price: 260 },
      { name: "Egg Hakka Noodles", category: "noodles", food_type: "egg", price: 150 },
      { name: "Egg Schezwan Noodles", category: "noodles", food_type: "egg", price: 170 },
      { name: "Egg Hong Kong Noodles", category: "noodles", food_type: "egg", price: 200 },
      
      // Momos
      { name: "Steam Momos (Veg)", category: "momos", food_type: "veg", price: 140 },
      { name: "Fried Momos (Veg)", category: "momos", food_type: "veg", price: 160 },
      { name: "Kurkure Momos (Veg)", category: "momos", food_type: "veg", price: 180 },
      { name: "Chilly Momos (Veg)", category: "momos", food_type: "veg", price: 210 },
      { name: "Steam Momos (Non-Veg)", category: "momos", food_type: "non_veg", price: 160 },
      { name: "Fried Momos (Non-Veg)", category: "momos", food_type: "non_veg", price: 180 },
      { name: "Kurkure Momos (Non-Veg)", category: "momos", food_type: "non_veg", price: 210 },
      { name: "Chilly Momos (Non-Veg)", category: "momos", food_type: "non_veg", price: 240 },
    ]

    const { data, error } = await supabaseClient
      .from('menu_items')
      .insert(menuItems)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Menu seeded successfully', count: data.length }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
