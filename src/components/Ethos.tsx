export function Ethos() {
  return (
    <section id="ethos" className="border-b border-basalt/15 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-basalt/15 flex flex-col justify-between">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink">01 / STUDIO DOCTRINE</span>
          <div className="my-8">
            <h2 className="font-serif text-4xl md:text-6xl leading-[0.92] tracking-tight">
              Why we removed<br /><span className="italic">the live monitor.</span>
            </h2>
          </div>
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ash">
            OPTICAL PRESENCE OVER SELF-SURVEILLANCE
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-basalt/15 flex flex-col justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">[STANDARD PHOTOBOOTH WITH TV]</span>
            <p className="my-6 text-base leading-relaxed text-basalt/80">
              When a television screen sits beside the lens, everyone in the room poses for the monitor. People freeze, fix their hair after every flash, and stare slightly off-axis at their own reflection.
            </p>
            <div className="pt-4 border-t border-basalt/15 font-mono text-[10px] tracking-[0.18em] uppercase text-ash">
              RESULT: STIFF POSTURE · OFF-AXIS GAZE
            </div>
          </div>
          <div className="p-6 md:p-12 bg-bone/40 flex flex-col justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermilion-ink">[THE FRAMES PROTOCOL — NO MONITOR]</span>
            <p className="my-6 text-base leading-relaxed text-basalt">
              By removing the live preview screen, we return your attention to the people standing beside you. You trigger the shutter at your own pace, laugh without checking a countdown, and leave with portraits that feel genuinely human.
            </p>
            <div className="pt-4 border-t border-basalt/15 font-mono text-[10px] tracking-[0.18em] uppercase text-basalt">
              RESULT: CANDID EXPRESSION · TRUE EYE CONTACT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}