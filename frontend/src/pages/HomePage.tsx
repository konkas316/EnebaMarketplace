
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Banner = {
  title: string;
  subtitle: string;
  button: string;
};

type ApiProduct = {
  id: string | number;
  title: string;
  slug: string;
  price: string | number;
};

type ApiProductRow = {
  id: string;
  title: string;
  slug: string;
  seller: string | null;
  price: string | null;
  stock: string | null;
};

type FeaturedGame = {
  title: string;
  slug: string;
  price: number;
  sellerCount: number;
};

function HomePage() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [bestSellers, setBestSellers] = useState<FeaturedGame[]>([]);
  const [deals, setDeals] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchHomepageData() {
      try {
        setLoading(true);
        setError("");

        const [
          bannerResponse,
          bestSellersResponse,
          dealsResponse,
          productsResponse,
        ] = await Promise.all([
          fetch("http://localhost:8000/api/home-banner.php"),
          fetch("http://localhost:8000/api/best-sellers.php"),
          fetch("http://localhost:8000/api/deals.php"),
          fetch("http://localhost:8000/api/products.php"),
        ]);

        if (
          !bannerResponse.ok ||
          !bestSellersResponse.ok ||
          !dealsResponse.ok ||
          !productsResponse.ok
        ) {
          throw new Error("Failed to load homepage content.");
        }

        const bannerData: Banner = await bannerResponse.json();
        const bestSellersData: ApiProduct[] =
          await bestSellersResponse.json();
        const dealsData: ApiProduct[] =
          await dealsResponse.json();
        const productsData: ApiProductRow[] =
          await productsResponse.json();

        function prepareGames(products: ApiProduct[]): FeaturedGame[] {
          return products.map((product) => {
            const availableOffers = productsData
              .filter(
                (row) =>
                  row.slug === product.slug &&
                  row.seller !== null &&
                  row.price !== null &&
                  Number(row.stock ?? 0) > 0
              )
              .sort(
                (a, b) => Number(a.price) - Number(b.price)
              );

            return {
              title: product.title,
              slug: product.slug,
              price:
                availableOffers.length > 0
                  ? Number(availableOffers[0].price)
                  : Number(product.price),
              sellerCount: availableOffers.length,
            };
          });
        }

        if (!cancelled) {
          setBanner(bannerData);
          setBestSellers(prepareGames(bestSellersData));
          setDeals(prepareGames(dealsData));
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHomepageData();

    return () => {
      cancelled = true;
    };
  }, []);

  function renderGames(games: FeaturedGame[]) {
    return games.map((game) => (
      <div
        key={game.slug}
        style={{
          border: "1px solid gray",
          padding: "10px",
          margin: "10px auto",
          borderRadius: "8px",
          maxWidth: "300px",
        }}
      >
        <h3>
          <Link to={`/product/${game.slug}`}>
            {game.title}
          </Link>
        </h3>

        {game.sellerCount > 0 ? (
          <>
            <p>
              From <strong>{game.price.toFixed(2)}€</strong>
            </p>

            <p>
              {game.sellerCount} seller
              {game.sellerCount !== 1 ? "s" : ""} available
            </p>

            <Link to={`/product/${game.slug}`}>
              <button>View Offers</button>
            </Link>
          </>
        ) : (
          <p>Currently unavailable</p>
        )}
      </div>
    ));
  }

  return (
    <div>
      {loading && <p>Loading homepage...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {banner && (
            <section style={{ padding: "20px" }}>
              <h1>{banner.title}</h1>
              <p>{banner.subtitle}</p>
              <Link to="/store">
                <button>{banner.button}</button>
              </Link>
            </section>
          )}

          <section>
            <h2>Best Sellers</h2>

            {bestSellers.length > 0 ? (
              renderGames(bestSellers)
            ) : (
              <p>No best sellers available.</p>
            )}
          </section>

          <section>
            <h2>Deals</h2>

            {deals.length > 0 ? (
              renderGames(deals)
            ) : (
              <p>No deals available.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default HomePage;
