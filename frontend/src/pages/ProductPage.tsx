
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type ProductPageProps = {
  addToCart: (game: string, seller?: string, price?: string) => void;
};

type ApiProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  platform: string;
  genre: string;
  image_url: string | null;
  offer_id: string | null;
  seller: string | null;
  price: string | null;
  region: string | null;
  stock: string | null;
};

type SellerOffer = {
  id: string;
  seller: string;
  region: string;
  price: number;
  stock: number;
};

type Product = {
  title: string;
  slug: string;
  platform: string;
  region: string;
  description: string;
  offers: SellerOffer[];
};

function ProductPage({ addToCart }: ProductPageProps) {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const response = await fetch(
          "http://localhost:8000/api/products.php"
        );

        if (!response.ok) {
          throw new Error("Failed to load product information.");
        }

        const data: ApiProductRow[] = await response.json();

        const productRows = data.filter((row) => row.slug === slug);

        if (productRows.length === 0) {
          if (!cancelled) setProduct(null);
          return;
        }

        const firstRow = productRows[0];

        const offers: SellerOffer[] = productRows
          .filter(
            (row) =>
              row.offer_id !== null &&
              row.seller !== null &&
              row.price !== null
          )
          .map((row) => ({
            id: row.offer_id!,
            seller: row.seller!,
            region: row.region ?? "Global",
            price: Number(row.price),
            stock: Number(row.stock ?? 0),
          }));

        const displayTitle =
          firstRow.slug === "gta-v" ? "GTA V" : firstRow.title;

        if (!cancelled) {
          setProduct({
            title: displayTitle,
            slug: firstRow.slug,
            platform: firstRow.platform,
            region: "Global",
            description: firstRow.description,
            offers,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading product...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/store">Return to Store</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Product Not Found</h2>
        <Link to="/store">Return to Store</Link>
      </div>
    );
  }

  const availableOffers = product.offers
    .filter((offer) => offer.stock > 0)
    .sort((a, b) => a.price - b.price);

  const cheapestOffer = availableOffers[0];

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <Link to="/store">← Back to Store</Link>

      <h1>{product.title}</h1>

      <p>
        <strong>Platform:</strong> {product.platform}
      </p>

      <p>
        <strong>Region:</strong> {product.region}
      </p>

      <p>{product.description}</p>

      <h2>Available Offers</h2>

      {availableOffers.length > 0 ? (
        availableOffers.map((offer) => (
          <div
            key={offer.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3>{offer.seller}</h3>
              <p>Region: {offer.region}</p>
              <strong>{offer.price.toFixed(2)}€</strong>
              {offer.id === cheapestOffer?.id && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  Cheapest offer
                </p>
              )}
            </div>

            <button
              onClick={() =>
                addToCart(
                  product.title,
                  offer.seller,
                  `${offer.price.toFixed(2)}€`
                )
              }
            >
              Add to Cart
            </button>
          </div>
        ))
      ) : (
        <p>No offers currently available.</p>
      )}

         
    </div>
  );
}

export default ProductPage;
