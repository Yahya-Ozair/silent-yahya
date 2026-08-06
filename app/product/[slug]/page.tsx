import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  if (!data.success) {
    notFound();
  }

  return (
    <ProductClient
      product={data.product}
    />
  );
}