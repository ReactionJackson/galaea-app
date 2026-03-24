// ─────────────────────────────────────────────────────────────────────────────
// Tags
//
// Tags are used for filtering/search. Tapping a tag on a saved entry shows a
// toast: "Search for '[tag]'?" — confirming opens a search/filter panel. TBC
// where this filter and searching functionality will appear, version 1 of the
// app will have tags as a purely static piece of information.
// ─────────────────────────────────────────────────────────────────────────────

export const tagsData = [
  {
    tagId: 1,
    name: "Grinding",
    color: "green",
  },
  {
    tagId: 2,
    name: "Switch Family Collective",
    color: "blue",
  },
  {
    tagId: 3,
    name: "Fun Moment",
    color: "yellow",
  },
  {
    tagId: 4,
    name: "Story",
    color: "purple",
  },
  {
    tagId: 5,
    name: "Progress",
    color: "red",
  },
  {
    tagId: 6,
    name: "Theory",
    color: "purple",
  },
  {
    tagId: 7,
    name: "Hardware",
    color: "default",
  },
  {
    tagId: 8,
    name: "Gaming Night",
    color: "blue",
  },
  {
    tagId: 9,
    name: "Boss Fight",
    color: "red",
  },
  {
    tagId: 10,
    name: "Side Quest",
    color: "green",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Games
//
// Each game owns its own entries array. An entry is a piece of writing about
// that game on a specific date. entryId in daysData references the actual
// entryId field on the entry object. "Entry XX" display numbers match entryId.
// ─────────────────────────────────────────────────────────────────────────────

export const gamesData = [
  {
    gameId: 1,
    title: "Xenoblade Chronicles 2",
    platform: "Nintendo Switch",
    genre: "JRPG",
    cover:
      "https://images.launchbox-app.com/b7a444fc-f6b3-415c-b270-55b9aab05756.jpg",
    entries: [
      {
        entryId: 1,
        text: "Still working through the affinity charts for the Torna blades. Patroka is done which took forever — her chart is massive compared to the others. Started on Akhos but hit a wall with one of the field skills needed, so ended up doing some sidequests in Uraya to grind it out. Not the most exciting session but it feels good to be making a dent in it. The Switch Family Collective makes it way less tedious, being able to share rare blades across saves is a lifesaver.",
        tags: [1, 2],
        gallery: [
          "https://images.launchbox-app.com/4b488f82-83f5-4088-a870-9ebe8f5c6c7d.jpg",
        ],
      },
      {
        entryId: 2,
        text: "Finished Chapter 7 tonight. Wasn't expecting it to hit as hard as it did — there's a couple of reveals in there that reframe a lot of what happened earlier in the game. Mythra is absolutely carrying the party right now, the damage output is ridiculous once you get her specials chained properly. Jin is a great antagonist, actually feels threatening rather than just being a hurdle. Excited to see where it goes from here.",
        tags: [4, 5],
        gallery: [
          "https://images.launchbox-app.com/b7a444fc-f6b3-415c-b270-55b9aab05756.jpg",
        ],
      },
      {
        entryId: 3,
        text: "Nearly there with the affinity charts. Rex and Pyra are fully maxed, Nia and Dromarch are done too. Just Zeke and Pandoria left which shouldn't take long. The endgame is in sight — I think I'm maybe three or four sessions away from finishing the main story. Bittersweet feeling, I've genuinely loved this one and I'm gonna miss having it as my active game.",
        tags: [5, 6],
        gallery: [
          "https://images.launchbox-app.com/4b488f82-83f5-4088-a870-9ebe8f5c6c7d.jpg",
          "https://images.launchbox-app.com/b7a444fc-f6b3-415c-b270-55b9aab05756.jpg",
          "https://images.launchbox-app.com/4b488f82-83f5-4088-a870-9ebe8f5c6c7d.jpg",
        ],
      },
    ],
  },
  {
    gameId: 2,
    title: "Astral Chain",
    platform: "Nintendo Switch",
    genre: "Action",
    cover:
      "https://images.launchbox-app.com/df8e26e5-c114-4774-8d98-d76d6602df87.jpg",
    entries: [
      {
        entryId: 1,
        text: "Started a fresh save on Astral Chain while Marc was here — he'd never seen it before and I wanted an excuse to play it again. The opening sequence still holds up, Platinum really nailed the vibe. The city design is incredible, it's got this cramped neon-soaked thing going on that I never get tired of looking at. Combat felt rusty at first but it comes back quickly. Probably going to stick with this as a secondary game alongside Xenoblade for a while.",
        tags: [3],
        gallery: [
          "https://images.launchbox-app.com/df8e26e5-c114-4774-8d98-d76d6602df87.jpg",
          "https://images.launchbox-app.com/9dd427ca-7e2c-4f12-a17c-0a25b2d43a2a.jpg",
        ],
      },
    ],
  },
  {
    gameId: 3,
    title: "Xenogears",
    platform: "PS1",
    genre: "JRPG",
    cover:
      "https://images.launchbox-app.com/ef51e342-83bf-4eaf-a36d-8b6c3bf48c2f.png",
    entries: [
      {
        entryId: 1,
        text: "First proper session. The RGB cable makes such a difference — colours are deep and clean on the CRT, no dot crawl at all. The game opens slow and I mean that in the best way, it's clearly not in a rush to explain anything. There's this weight to the world that you don't really get from modern games. The combat is turn-based with this combo system where you spend AP hitting different buttons, simple on the surface but I can tell it opens up. Already know this is going to be a long one.",
        tags: [1, 3],
        gallery: [
          "https://images.launchbox-app.com/ef51e342-83bf-4eaf-a36d-8b6c3bf48c2f.png",
          "https://images.launchbox-app.com/925e2983-eb49-43b7-996e-2073914c51a5.png",
          "https://images.launchbox-app.com/3f2f7ed2-b34f-424d-90b9-0ef376de8531.png",
        ],
      },
      {
        entryId: 2,
        text: "Short one tonight. Made it to Lahan village and did the opening section there. The dialogue is dense — this is clearly a game that expects you to pay attention. Had to look up how one of the early puzzles worked but I don't feel bad about it, the game gives you nothing. The combat is starting to click though, getting the AP combos to land properly feels satisfying.",
        tags: [5],
        gallery: [],
      },
    ],
  },
  {
    gameId: 4,
    title: "Parasite Eve",
    platform: "PS1",
    genre: "Action",
    cover:
      "https://images.launchbox-app.com/df8e26e5-c114-4774-8d98-d76d6602df87.jpg",
    entries: [
      {
        entryId: 1,
        text: "Started Parasite Eve tonight. The game is a lot more approachable than Xenogears, the tutorial is very clear and the combat is much more forgiving. The story is interesting but I'm not sure I'm hooked yet — the pacing is a bit slow and I'm not sure I understand the point of the game yet.",
        tags: [3],
        gallery: [],
      },
      {
        entryId: 2,
        text: "Made some progress on Parasite Eve tonight. The game is starting to feel more engaging now — the story is more interesting and the combat is more fun. The puzzles are starting to click and I'm getting the hang of the game. The game is definitely a slow burn but I'm enjoying it so far.",
        tags: [5],
        gallery: [
          "https://images.launchbox-app.com//0cc69537-216a-4c96-bf16-c6b1299acefc.jpg",
          "https://images.launchbox-app.com//7c180d3f-3426-4ec6-bcad-03e2d89cea57.jpg",
          "https://images.launchbox-app.com//14b11046-ef42-4ae6-9d70-5b0708460078.jpg",
        ],
      },
    ],
  },
  {
    gameId: 5,
    title: "Final Fantasy: Crystal Chronicles - The Crystal Bearers",
    platform: "Wii",
    genre: "RPG",
    cover:
      "https://images.launchbox-app.com/740460a2-d617-4931-a67c-365691359814.jpg",
    entries: [
      {
        entryId: 1,
        text: "Started Crystal Bearers tonight. It's not really like the other Crystal Chronicles games, it's more of a traditional Final Fantasy game. The story is interesting but I'm not sure I'm hooked yet — the pacing is a bit slow and I'm not sure I understand the point of the game yet.",
        tags: [3],
        gallery: [],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Days
//
// Sorted oldest → newest. Track relies on this order for its circles.
// games[] here contains only { gameId, entryId } references — look up the
// full game record and its entry by joining against the games list above.
// ─────────────────────────────────────────────────────────────────────────────

export const daysData = [
  {
    dayId: 1,
    date: "2025-11-04T21:00:00.000Z",
    title: "",
    text: "First proper evening with Xenoblade 2. Been meaning to start this for ages and finally made the leap. The opening is a lot — characters, lore, names all thrown at you at once. But the world design is immediately striking, the cloud sea concept is unlike anything I've seen. Combat is completely opaque right now but I'm told it takes a few hours to click.",
    tags: [1, 4],
    games: [{ gameId: 1, entryId: 1 }],
  },
  {
    dayId: 2,
    date: "2025-11-11T20:30:00.000Z",
    title: "",
    text: "Good few hours on Xenoblade tonight. Combat is starting to make more sense — the flow arts and blade specials are clicking now. Got Nia in the party which is a big deal, she's immediately the most interesting character so far. The Mor Ardain section has been a highlight, the industrial aesthetic is a nice contrast to the organic stuff before it.",
    tags: [5],
    games: [{ gameId: 1, entryId: 1 }],
  },
  {
    dayId: 3,
    date: "2025-11-19T19:15:00.000Z",
    title: "",
    text: "Picked up Astral Chain in the sale. Haven't started it yet but wanted to log that it's in the queue. Spent most of tonight finishing off a few sidequests in Xenoblade instead — the Uraya region has some good ones. Bana is a brilliant villain, completely ridiculous in exactly the right way.",
    tags: [2],
    games: [{ gameId: 1, entryId: 1 }],
  },
  {
    dayId: 4,
    date: "2025-12-22T22:00:00.000Z",
    title: "Christmas break starts",
    text: "Off work now until January which means actual gaming time. Sat down with Xenoblade for a long session tonight — made it through the end of Chapter 4 which ended on a proper gut-punch moment. Didn't see it coming at all. The story is doing things I didn't expect from the opening hours. Good time to be playing this.",
    tags: [2, 4],
    games: [{ gameId: 1, entryId: 2 }],
  },
  {
    dayId: 5,
    date: "2025-12-28T16:00:00.000Z",
    title: "",
    text: "Lazy Sunday between Christmas and new year. Finally put a few hours into Astral Chain. The tone is completely different to what I expected — way more anime and stylised than the trailers suggested. Combat is satisfying once the Legion system clicks. The city hub sections have a nice investigative feel, reminds me a bit of Nier in how it builds the world quietly.",
    tags: [3],
    games: [{ gameId: 2, entryId: 1 }],
  },
  {
    dayId: 6,
    date: "2026-01-03T20:45:00.000Z",
    title: "Back to it",
    text: "New year, back to gaming properly. Spent the session on Xenoblade grinding some affinity with the Ursula blade — the trust system is slow but rewarding. Also did a bit of exploring in Leftheria which I'd been rushing through. The environmental variety in this game is genuinely impressive, every region feels distinct.",
    tags: [1, 5],
    games: [{ gameId: 1, entryId: 1 }],
  },
  {
    dayId: 7,
    date: "2026-01-07T21:00:00.000Z",
    title: "",
    text: "Chipped away at Astral Chain for a couple of hours. The combat is really opening up now — the chimera designs are getting more creative and the fights are starting to feel like puzzles. The sync attack system when you line up correctly with your legion is incredibly satisfying. This might be Platinum's best looking game.",
    tags: [3],
    games: [{ gameId: 2, entryId: 1 }],
  },
  {
    dayId: 8,
    date: "2026-01-11T19:00:00.000Z",
    title: "",
    text: "Ordered a PS1 and some games off eBay tonight. Been thinking about it for a while — there's a whole library I've never touched and emulation isn't the same. Got Xenogears, Parasite Eve and Vagrant Story in the lot. No RGB cable yet so I'll hold off starting any of them until it arrives.",
    tags: [3, 2],
    games: [],
  },
  {
    dayId: 9,
    date: "2026-01-18T20:00:00.000Z",
    title: "",
    text: "Big session on Xenoblade. Finished Chapter 5 and pushed into 6. The tone has shifted noticeably — things are getting darker and the stakes feel real now. Rex's development has been gradual but it's paying off. Poppi QT Pi has completely replaced KOS-MOS in my main team composition, the customisation options are just better.",
    tags: [5, 4],
    games: [{ gameId: 1, entryId: 2 }],
  },
  {
    dayId: 10,
    date: "2026-01-24T21:30:00.000Z",
    title: "",
    text: "Astral Chain case file 7 done. The game keeps escalating in interesting ways — the chimeras are getting properly unsettling now. Found a few of the hidden items in the files that I'd completely missed on first pass. The investigation sections reward thoroughness in a way that doesn't feel tedious. Also dug out Crystal Bearers on the Wii for an hour before bed — hadn't touched it in years and was curious if it holds up.",
    tags: [5, 3],
    games: [
      { gameId: 2, entryId: 1 },
      { gameId: 5, entryId: 1 },
    ],
  },
  {
    dayId: 11,
    date: "2026-01-30T22:15:00.000Z",
    title: "",
    text: "PS1 arrived. Composite cables only for now so I can't start any of the NTSC games yet, the rainbow shimmer is too distracting. Had a look at the menus and tested it was working though. RGB cable is on order — apparently back in stock in February. Impatient but it's worth waiting for.",
    tags: [7, 3],
    games: [],
  },
  {
    dayId: 12,
    date: "2026-02-04T20:30:00.000Z",
    title: "",
    text: "Finished Astral Chain. The final act goes completely off the rails in the best possible way — Platinum clearly saved the wildest ideas for the end. Credits rolled at about 30 hours. Not sure I'll go back for S ranks but I'm satisfied with where I ended up. Back to focusing on Xenoblade as the main game now.",
    tags: [5, 3],
    games: [{ gameId: 2, entryId: 1 }],
  },
  {
    dayId: 13,
    date: "2026-02-09T19:00:00.000Z",
    title: "",
    text: "Heavy Xenoblade session. Deep into the affinity charts now — this is the part everyone warns you about. Some of the field skill requirements are annoying but the blade content attached to them is genuinely good, lots of small stories you'd completely miss otherwise. Running the Switch Family Collective with a mate helps a lot for getting rare blades.",
    tags: [1, 2],
    games: [{ gameId: 1, entryId: 1 }],
  },
  {
    dayId: 14,
    date: "2026-02-15T21:00:00.000Z",
    title: "",
    text: "Started thinking seriously about what's next after Xenoblade. The queue is getting long — Xenogears obviously, then probably Vagrant Story or Parasite Eve. Also want to go back to something shorter and action-focused at some point, maybe Bayonetta or Devil May Cry 5. For now still very much in the middle of Xenoblade though.",
    tags: [3],
    games: [{ gameId: 1, entryId: 3 }],
  },
  {
    dayId: 15,
    date: "2026-02-22T20:00:00.000Z",
    title: "",
    text: "Made serious progress on the affinity charts tonight. Rex, Pyra, and Nia are all done. The endgame feels close — maybe five or six sessions away. Starting to feel bittersweet about finishing it, I've had this as my main game for months. Going to miss the routine of it.",
    tags: [5, 1],
    games: [{ gameId: 1, entryId: 3 }],
  },
  {
    dayId: 16,
    date: "2026-02-28T21:30:00.000Z",
    title: "",
    text: "RGB cable for the PS1 shipped — tracking says Tuesday. Almost done with the Xenoblade affinity work, just Zeke and Pandoria left which should be quick. Might line it up so I finish Xenoblade around the same time the cable arrives and I can start Xenogears as a clean handoff. That would be a good week.",
    tags: [3, 4],
    games: [{ gameId: 1, entryId: 3 }],
  },
  {
    dayId: 17,
    date: "2026-03-05T15:24:00.000Z",
    title: "Leeds Gaming Market",
    text: "Phil and Marc came over today for the gaming market downstairs. Finally bought my original PlayStation, got a chipped region-unlocked one so I can play Parasite Eve, Xenogears and all that. I'm gonna have to spend a bit to get them good quality but I've always wanted to play them. I need to get an RGB cable as well as the NTSC games have a mad rainbow looking filter on top, but I've found somewhere that does them and they're back in stock next month. Banging day anyway today, finished off with a Bundo as well 🤌",
    tags: [3, 8],
    games: [
      { gameId: 1, entryId: 1 },
      { gameId: 2, entryId: 1 },
    ],
  },
  {
    dayId: 18,
    date: "2026-03-08T20:10:00.000Z",
    title: "",
    text: "Quiet Sunday. Didn't do much today, cooked a big pasta in the afternoon and then just ended up on Xenoblade for most of the evening. Exactly the kind of day you need sometimes — no plans, no pressure, just the game. Chapter 7 delivered.",
    tags: [3, 4],
    games: [{ gameId: 1, entryId: 2 }],
  },
  {
    dayId: 19,
    date: "2026-03-12T21:45:00.000Z",
    title: "RGB cable arrived",
    text: "The RGB cable for the PS1 came almost a week early, wasn't expecting it until the weekend. Plugged it straight in and the difference is night and day — the rainbow interference is completely gone and everything looks sharp and saturated, exactly how it should look. Can't believe I nearly just put up with composite. Fired up Xenogears straight away and played for about two hours.",
    tags: [7, 2],
    games: [{ gameId: 3, entryId: 1 }],
  },
  {
    dayId: 20,
    date: "2026-03-16T19:30:00.000Z",
    title: "",
    text: "Got back from work later than planned and didn't have the energy for much. Put Xenogears on for an hour or so, made some progress but mostly just needed to decompress. The CRT warm-up glow is genuinely one of the most relaxing things to sit in front of. Also finally cracked open Parasite Eve — only did the opera house opening but the tone is immediately striking.",
    tags: [3, 7],
    games: [
      { gameId: 3, entryId: 2 },
      { gameId: 4, entryId: 1 },
    ],
  },
  {
    dayId: 21,
    date: "2026-03-20T10:00:00.000Z",
    title: "Morning gaming, then dev",
    text: "Started the morning with some Xenoblade before doing anything else, which is always a good sign for the day. Spent the afternoon doing some work on the journal app — got the PWA manifest set up so it can be saved to the home screen properly and opens without the Safari bar. Feels way more like a real app now. Small detail but it matters.",
    tags: [3, 2],
    games: [
      { gameId: 1, entryId: 3 },
      { gameId: 3, entryId: 1 },
      { gameId: 4, entryId: 2 },
    ],
  },
];
