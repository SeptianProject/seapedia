import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  imageUrl?: string | null;
  store: { name: string };
}

export default function ProductCard({
  name,
  price,
  imageUrl,
  store,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price));

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white">
      <div className="relative w-full aspect-square bg-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>
        <p className="text-blue-600 font-bold">{formattedPrice}</p>
        <p className="text-xs text-gray-500">{store.name}</p>
      </div>
    </div>
  );
}
