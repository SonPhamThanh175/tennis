/** Hình vợt dùng cho logo và chỗ chưa có ảnh sản phẩm. */
export function RacquetMark({
  className = 'h-10 w-8',
  muted = false,
}: {
  className?: string;
  muted?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/racquet-mark.svg"
      alt=""
      className={`${className} ${muted ? 'opacity-35 grayscale' : ''}`}
    />
  );
}
