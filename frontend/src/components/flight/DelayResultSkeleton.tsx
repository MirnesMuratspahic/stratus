import { Card, CardContent } from "@/components/ui/card";

export function DelayResultSkeleton() {
  return (
    <Card className="border-2 border-slate-200">
      <CardContent className="pt-5 space-y-4 animate-pulse">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 rounded-full bg-slate-200" />
                <div className="h-5 w-24 rounded bg-slate-200" />
              </div>
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          </div>
          <div className="h-6 w-28 rounded-full bg-slate-200 shrink-0" />
        </div>

        <div className="space-y-2 pt-1">
          <div className="h-3 w-36 rounded bg-slate-200" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-6 rounded bg-slate-200" />
              <div className="flex-1 h-2 rounded-full bg-slate-200" />
              <div className="h-4 w-10 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <div className="h-8 w-24 rounded bg-slate-200" />
        </div>
      </CardContent>
    </Card>
  );
}
