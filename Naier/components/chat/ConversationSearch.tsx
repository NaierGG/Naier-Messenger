"use client";

import { useMemo, useState } from "react";
import { debounce } from "@/lib/utils/debounce";

interface ConversationSearchProps {
  onSearch: (query: string) => void;
}

export function ConversationSearch({ onSearch }: ConversationSearchProps) {
  const [value, setValue] = useState("");
  const debouncedSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  return (
    <div className="relative">
      <input
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-11 text-sm text-zinc-100 outline-none transition focus:border-sky-500"
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          debouncedSearch(nextValue);
        }}
        placeholder="Search conversations"
        value={value}
      />
      {value ? (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
          type="button"
        >
          X
        </button>
      ) : null}
    </div>
  );
}
