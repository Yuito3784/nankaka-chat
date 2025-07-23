type Props = {
  role: "user" | "ai";
  content: string;
};

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}>
      {/* メッセージ本体 */}
      <div
        className={`px-4 py-2 rounded-xl text-sm whitespace-pre-wrap max-w-[75%] ${
          isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        {content}
      </div>

      {/* AIのメッセージには広告を下に表示 */}
      {!isUser && (
        <div className="text-xs text-gray-500 mt-1 px-2 max-w-[75%]">
          🧾 <span className="text-gray-700 font-semibold">病院に行く前に、無料で医師に相談できます</span> 👉{" "}
          <a
            href="https://px.a8.net/svt/ejp?a8mat=XXXXXXXXXX" // ←A8.netなどのアフィリエイトリンクに差し替え
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            オンライン診療はこちら
          </a>
        </div>
      )}
    </div>
  );
}
