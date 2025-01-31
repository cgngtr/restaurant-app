export default function TestDynamicPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1>Dynamic Test Page</h1>
      <p>ID: {params.id}</p>
    </div>
  )
} 