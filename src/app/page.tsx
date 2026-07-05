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
    <div className="relative mx-auto max-w-7xl px-6 py-10">
      <div className="absolute left-8 top-6 h-44 w-44 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute right-0 top-32 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-900/10 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.28),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.2),_transparent_28%)]" />
        <div className="relative max-w-2xl space-y-5">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
            Marketplace management
          </span>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Katalog produk yang cepat, rapi, dan siap dipakai.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
            Jelajahi produk, berikan ulasan, dan kelola transaksi dari satu
            tempat dengan tampilan yang lebih fokus.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Katalog Produk
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Produk terbaru dari toko yang tersedia.
            </p>
          </div>
          <div className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm md:block">
            {products.length} produk tersedia
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur-sm">
            <p className="text-slate-600">Belum ada produk tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-2xl">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">
            Beri Ulasan Aplikasi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Masukan singkat membantu kami memperbaiki pengalaman pengguna.
          </p>
        </div>
        <ReviewForm />
      </section>
    </div>
  );
}
