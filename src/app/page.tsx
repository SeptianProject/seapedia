import ProductCard from "@/components/ui/ProductCard";
import ReviewForm from "@/components/ReviewForm";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  store: { name: string };
}

interface ProductsResponse {
  data: Product[];
}

// Server-side fetch, no-store biar data produk selalu fresh (stock berubah cepat)
async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json: ProductsResponse = await res.json();
  return json.data;
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <section>
        <h1 className="text-3xl font-bold mb-6">Katalog Produk</h1>

        {products.length === 0 ? (
          <p className="text-gray-500">Belum ada produk tersedia.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Beri Ulasan Aplikasi</h2>
        <ReviewForm />
      </section>
    </div>
  );
}
