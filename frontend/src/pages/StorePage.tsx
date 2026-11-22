
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

type StoreGame = {
  id: string;
  title: string;
  slug: string;
  platform: string;
  offers: {
    seller: string;
    price: number;
    region: string;
    stock: number;
  }[];
};

function StorePage() {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState<StoreGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [platformFilter, setPlatformFilter] = useState("All platforms");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    let cancelled = false;

    async function fetchGames() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8000/api/products.php"
        );

        if (!response.ok) {
          throw new Error("Failed to load products from the server.");
        }

        const data: ApiProductRow[] = await response.json();
        const groupedGames = new Map<string, StoreGame>();

        data.forEach((row) => {
          if (!groupedGames.has(row.id)) {
            groupedGames.set(row.id, {
              id: row.id,
              title: row.slug === "gta-v" ? "GTA V" : row.title,
              slug: row.slug,
              platform: row.platform,
              offers: [],
            });
          }

          const game = groupedGames.get(row.id)!;

          if (row.offer_id && row.seller && row.price !== null) {
            game.offers.push({
              seller: row.seller,
              price: Number(row.price),
              region: row.region ?? "Global",
              stock: Number(row.stock ?? 0),
            });
          }
        });

        if (!cancelled) {
          setGames(Array.from(groupedGames.values()));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchGames();

    return () => {
      cancelled = true;
    };
  }, []);

  const platforms = Array.from(
    new Set(games.map((game) => game.platform).filter(Boolean))
  ).sort();

  const regions = Array.from(
    new Set(
      games.flatMap((game) =>
        game.offers.map((offer) => offer.region)
      ).filter(Boolean)
    )
  ).sort();

  const filteredGames = games
    .map((game) => {
      let availableOffers = game.offers.filter(
        (offer) => offer.stock > 0
      );

      if (regionFilter !== "All regions") {
        availableOffers = availableOffers.filter(
          (offer) => offer.region === regionFilter
        );
      }

      const cheapestOffer = [...availableOffers].sort(
        (a, b) => a.price - b.price
      )[0];

      return {
        ...game,
        availableOffers,
        cheapestOffer,
      };
    })
    .filter((game) => {
      const matchesSearch = game.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPlatform =
        platformFilter === "All platforms" ||
        game.platform === platformFilter;

      const matchesMinPrice =
        minPrice === "" ||
        (game.cheapestOffer !== undefined &&
          game.cheapestOffer.price >= Number(minPrice));

      const matchesMaxPrice =
        maxPrice === "" ||
        (game.cheapestOffer !== undefined &&
          game.cheapestOffer.price <= Number(maxPrice));

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return (
          (a.cheapestOffer?.price ?? Infinity) -
          (b.cheapestOffer?.price ?? Infinity)
        );
      }

      if (sortBy === "price-high") {
        return (
          (b.cheapestOffer?.price ?? -Infinity) -
          (a.cheapestOffer?.price ?? -Infinity)
        );
      }

      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }

      return 0;
    });

  const resetFilters = () => {
    setSearch("");
    setPlatformFilter("All platforms");
    setRegionFilter("All regions");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Store</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px" }}
        />

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          style={{ padding: "10px" }}
        >
          <option value="All platforms">All platforms</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          style={{ padding: "10px" }}
        >
          <option value="All regions">All regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Min price (€)"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: "10px", width: "110px" }}
        />

        <input
          type="number"
          min="0"
          placeholder="Max price (€)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: "10px", width: "110px" }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "10px" }}
        >
          <option value="default">Default sorting</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>

        <button onClick={resetFilters} style={{ padding: "10px" }}>
          Reset Filters
        </button>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <p>{filteredGames.length} products found</p>
      )}

      {!loading && !error && filteredGames.length === 0 && (
        <p>No games found. Try changing your filters.</p>
      )}

      <div>
        {!loading &&
          !error &&
          filteredGames.map((game) => (
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

              <p>Platform: {game.platform}</p>

              {game.cheapestOffer ? (
                <>
                  <p>
                    From {game.cheapestOffer.price.toFixed(2)}€
                  </p>

                  <p>
                    {game.availableOffers.length} seller
                    {game.availableOffers.length !== 1 ? "s" : ""} available
                  </p>

                  <Link to={`/product/${game.slug}`}>
                    <button>View Offers</button>
                  </Link>
                </>
              ) : (
                <p>Currently unavailable</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default StorePage;
