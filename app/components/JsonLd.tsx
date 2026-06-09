/** Renders a JSON-LD structured-data script tag. Server component. */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // schema is trusted, server-rendered
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
