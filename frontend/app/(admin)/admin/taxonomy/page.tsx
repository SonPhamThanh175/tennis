import { Taxonomy } from './_components/taxonomy';

export default function TaxonomyPage() {
  return (
    <>
      <h1 className="display mb-6 text-4xl">Thương hiệu & danh mục</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <Taxonomy kind="brands" title="Thương hiệu" />
        <Taxonomy kind="categories" title="Danh mục" />
      </div>
    </>
  );
}
