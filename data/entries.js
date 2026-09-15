// ─────────────────────────────────────────────────────────────────────────────
// Tags
//
// Tags are used for filtering/search. Tapping a tag on a saved entry shows a
// toast: "Search for '[tag]'?" — confirming opens a search/filter panel. TBC
// where this filter and searching functionality will appear, version 1 of the
// app will have tags as a purely static piece of information.
// ─────────────────────────────────────────────────────────────────────────────

export const sampleTagsData = [
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
// Items
//
// Each item owns its own entries array. An entry is a piece of writing about
// that item on a specific date. entryId in daysData references the actual
// entryId field on the entry object. "Entry XX" display numbers match entryId.
// ─────────────────────────────────────────────────────────────────────────────

export const sampleItemsData = [
  {
    itemId: 9,
    title: "Final Fantasy VIII",
    coverImage:
      "https://scontent-man2-1.xx.fbcdn.net/v/t39.30808-6/498668182_24248751934725854_1547251855375356738_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1502&ctp=s2048x1502&_nc_cat=110&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=oTQ9UgWrJjcQ7kNvwHr2Lps&_nc_oc=Adr_Rp1OJ3aeD8TydCTBTnqOFEYAgBHnQfg5A9rjuMrWPsBOiFwnJrFH6dj_dr-Gv-GAVSqPXVUCcE-L2DbNeY59&_nc_zt=23&_nc_ht=scontent-man2-1.xx&_nc_gid=ZItUcqnxPKp_SYTHHzFzYg&_nc_ss=7b2a8&oh=00_AQJfoVXVgZ1X7WfSxlo7HoHBELirDr13RKOU9tr-4OzAwg&oe=6AAE50E1",
    cardImage:
      "https://storage.googleapis.com/images.pricecharting.com/827ad98ce4b57f459a021c364ec66247de62fdf72fbb22ad42a0894cb3af6da0/240.jpg",
    entries: [
      {
        entryId: 1,
        date: "2025-11-04T21:00:00.000Z",
        text: "Dug out Final Fantasy VIII to replay for what must be the tenth time. Doesn't matter how many times I've done the opening at Balamb Garden, the training centre and the Squall/Seifer duel still hit the same way. Junction system is going to take some re-learning since I always forget the specifics between playthroughs, but drawing magic from the T-Rexaur in the training centre brought it all back fast. Feels like coming home.",
        tags: [4, 3],
        gallery: [],
      },
      {
        entryId: 2,
        date: "2025-11-11T20:30:00.000Z",
        text: "Dollet mission done, passed the SeeD exam first go which never gets old. The Iron Giant on the parade route always throws me even knowing it's coming. Rinoa's introduction at the end of the mission remains one of my favourite character intros in the whole series, that scene does so much with so little dialogue. Officially a SeeD now, onwards to the Garden festival stuff.",
        tags: [4, 5],
        gallery: [
          "https://images.launchbox-app.com/2c4aa667-9cef-4ae7-b674-e172edcf17d3.png",
        ],
      },
      {
        entryId: 3,
        date: "2025-11-19T19:15:00.000Z",
        text: "Pushed on into the Timber mission with Zell and Selphie. The train heist sequence is still one of the best set pieces in the game, the tension of timing everything against Fujin and Raijin chasing you down never gets old. Also spent a while messing about with the Chocobo World download mechanic on the memory card just for nostalgia, even though I don't think I'll actually play much of it this time.",
        tags: [4, 10],
        gallery: [],
      },
      {
        entryId: 4,
        date: "2025-12-28T16:00:00.000Z",
        text: "Galbadia Garden arc going well. Quistis and Irvine both back in the party which rounds out the core cast nicely. The sniping sequence with Irvine at the parade is a genuine highlight, the tension of the countdown always gets me even knowing how it plays out. President Deling's assassination attempt going sideways is such a strong turning point for the story.",
        tags: [4, 3],
        gallery: [],
      },
      {
        entryId: 5,
        date: "2026-01-03T20:45:00.000Z",
        text: "Completely derailed by Triple Triad again, exactly like every single playthrough. Spent almost the entire session just hunting down new opponents around Balamb Garden and Dollet for cards instead of touching the main story. Finally got a Quezacotl card off one of the students in the quad and I'm disproportionately pleased about it. The Random rule spreading to different regions is going to make this an actual project this time round rather than just a side distraction.",
        tags: [3, 10],
        gallery: [
          "https://static.wikia.nocookie.net/finalfantasy/images/9/9c/Tripletriad2.jpg/revision/latest?cb=20191114190808",
          "https://static.wikia.nocookie.net/finalfantasy/images/6/6a/Triple_triad_choose.png/revision/latest?cb=20191019024704",
          "https://upload.wikimedia.org/wikipedia/en/6/69/Triple_Triad_gameplay_screenshot.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
        ],
      },
      {
        entryId: 6,
        date: "2026-01-07T21:00:00.000Z",
        text: "The Garden vs Garden battle happened and it's still unbelievable how ambitious that sequence is for a PS1 game, two entire school buildings duking it out mid-flight. Edea's reveal as the sorceress recontextualises a big chunk of what's happened so far. Also finally got round to actually reading some of the Timber Maniacs magazines I'd been ignoring, some good lore nuggets buried in the flavour text.",
        tags: [4, 9],
        gallery: [
          "https://images.launchbox-app.com/45b6fe15-6613-40dc-a252-daba3fc9dc4a.png",
          "https://images.launchbox-app.com/eba60d94-ed0a-4d92-aabc-ef4ee5e7cda0.png",
        ],
      },
      {
        entryId: 7,
        date: "2026-01-18T20:00:00.000Z",
        text: "Big story chunk tonight — Balamb Garden turning into a mobile fortress mid-game still gets me every time, such a strange and brilliant idea for a school setting. Rinoa and Squall's dynamic is developing nicely, the ball scene flashback stuff lands better as an adult than it ever did as a teenager playing this originally. Disc 2 pacing is relentless once it gets going.",
        tags: [4, 5],
        gallery: [],
      },
      {
        entryId: 8,
        date: "2026-01-24T21:30:00.000Z",
        text: "Junction Machine Ind went down after a rough couple of attempts — kept underestimating how much its attacks scale with your own average level, classic FF8 level-scaling trap that catches me out basically every playthrough despite knowing better. Adjusted a few junctions before the rematch and it was night and day. Rinoa's Angelo Sword limit break carrying a lot of the damage right now.",
        tags: [9, 5],
        gallery: [],
      },
      {
        entryId: 9,
        date: "2026-02-09T19:00:00.000Z",
        text: "Deep into the Esthar section now, the sudden jump in scale and technology after three discs of Garden politics is a great tonal shift. Spent a while theorising with an old FAQ open about how the whole time compression plot actually threads together, which I remember being divisive back in the day but I've always found it more coherent than people give it credit for. Adel's capsule design is properly unsettling.",
        tags: [4, 6],
        gallery: [],
      },
      {
        entryId: 10,
        date: "2026-02-15T21:00:00.000Z",
        text: "Got the Ragnarok, which might be my favourite vehicle in any Final Fantasy game just for how it looks and moves. The Lunar Cry event chapter playing as Laguna's squad again is a nice structural swap, always forget how much I enjoy controlling that trio until I'm back in it. Properly excited for the endgame stretch now.",
        tags: [4, 3],
        gallery: [
          "https://images.launchbox-app.com/r2_40b7a05c-25f3-4211-aab2-f4c7abd6305f.jpg",
        ],
      },
      {
        entryId: 11,
        date: "2026-02-22T20:00:00.000Z",
        text: "Ultimecia's Castle done and the credits rolled again. The final stretch through the castle puzzles into the boss rush against past bosses is still a great send-off, and Ultimecia herself remains one of the more visually striking final bosses in the series even by today's standards. That ending montage gets me every single time no matter how many playthroughs deep I am. Already itching to start the next one over, which is exactly the FF8 curse.",
        tags: [4, 5, 9],
        gallery: [],
      },
    ],
  },
  {
    itemId: 1,
    title: "Xenoblade Chronicles 2",
    coverImage:
      "https://images.launchbox-app.com/b7a444fc-f6b3-415c-b270-55b9aab05756.jpg",
    cardImage:
      "https://images.launchbox-app.com/08652ae7-93e9-4b2a-b300-fb41ffb43528.jpg",
    entries: [
      {
        entryId: 1,
        date: "2025-11-04T21:00:00.000Z",
        text: "Still working through the affinity charts for the Torna blades. Patroka is done which took forever — her chart is massive compared to the others. Started on Akhos but hit a wall with one of the field skills needed, so ended up doing some sidequests in Uraya to grind it out. Not the most exciting session but it feels good to be making a dent in it. The Switch Family Collective makes it way less tedious, being able to share rare blades across saves is a lifesaver.",
        tags: [1, 2],
        gallery: [
          "https://images.launchbox-app.com/4b488f82-83f5-4088-a870-9ebe8f5c6c7d.jpg",
        ],
      },
      {
        entryId: 2,
        date: "2025-12-22T22:00:00.000Z",
        text: "Finished Chapter 7 tonight. Wasn't expecting it to hit as hard as it did — there's a couple of reveals in there that reframe a lot of what happened earlier in the game. Mythra is absolutely carrying the party right now, the damage output is ridiculous once you get her specials chained properly. Jin is a great antagonist, actually feels threatening rather than just being a hurdle. Excited to see where it goes from here.",
        tags: [4, 5],
        gallery: [
          "https://images.launchbox-app.com/b7a444fc-f6b3-415c-b270-55b9aab05756.jpg",
        ],
      },
      {
        entryId: 3,
        date: "2026-02-15T21:00:00.000Z",
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
    itemId: 2,
    title: "Astral Chain",
    coverImage:
      "https://images.launchbox-app.com/df8e26e5-c114-4774-8d98-d76d6602df87.jpg",
    cardImage:
      "https://images.launchbox-app.com/43d7a157-3cf4-4926-8976-1d19aa03457e.jpg",
    entries: [
      {
        entryId: 1,
        date: "2025-12-28T16:00:00.000Z",
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
    itemId: 3,
    title: "Xenogears",
    coverImage:
      "https://images.launchbox-app.com/ef51e342-83bf-4eaf-a36d-8b6c3bf48c2f.png",
    cardImage:
      "https://images.launchbox-app.com/r2_9f7ecc57-3c83-49a1-9691-8b6a9dcb3b09.jpg",
    entries: [
      {
        entryId: 1,
        date: "2026-03-12T21:45:00.000Z",
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
        date: "2026-03-16T19:30:00.000Z",
        text: "Short one tonight. Made it to Lahan village and did the opening section there. The dialogue is dense — this is clearly a game that expects you to pay attention. Had to look up how one of the early puzzles worked but I don't feel bad about it, the game gives you nothing. The combat is starting to click though, getting the AP combos to land properly feels satisfying.",
        tags: [5],
        gallery: [],
      },
    ],
  },
  {
    itemId: 4,
    title: "Parasite Eve",
    coverImage:
      "https://i.pinimg.com/736x/48/27/93/482793fc1fa254378ba3a51a3cef6974.jpg",
    cardImage:
      "https://images.launchbox-app.com/r2_7234b4db-0032-4eb3-83d6-a3595c55193e.jpg",
    entries: [
      {
        entryId: 1,
        date: "2026-03-16T19:30:00.000Z",
        text: "Started Parasite Eve tonight. The game is a lot more approachable than Xenogears, the tutorial is very clear and the combat is much more forgiving. The story is interesting but I'm not sure I'm hooked yet — the pacing is a bit slow and I'm not sure I understand the point of the game yet.",
        tags: [3],
        gallery: [],
      },
      {
        entryId: 2,
        date: "2026-03-20T10:00:00.000Z",
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
    itemId: 5,
    title: "Elden Ring",
    coverImage:
      "https://images.launchbox-app.com/01a7a6ba-14ea-4232-a741-59b12ee05a29.jpg",
    cardImage:
      "https://images.launchbox-app.com/f4cf7db9-c812-4a36-a5eb-1e9bcd6b6c37.jpg",
    entries: [
      {
        entryId: 1,
        date: "2026-01-11T19:00:00.000Z",
        text: "Finally started Elden Ring after putting it off for way too long. Spent the whole session just wandering Limgrave without really following any direction, which I think is exactly how you're supposed to play it. Found Stormveil Castle in the distance early and immediately regretted going near it — got absolutely folded by the tutorial boss on the bridge, then found out there was a whole different way in round the side. The scale of the map from up on those cliffs is something else, can already tell this is going to eat a huge chunk of the year.",
        tags: [10, 3],
        gallery: [
          "https://images.launchbox-app.com/f0b1a59c-a7b7-496a-bb0e-32f47a9044fc.jpg",
          "https://images.launchbox-app.com/2e737110-f626-492f-af15-bd155dbea4d0.jpg",
        ],
      },
      {
        entryId: 2,
        date: "2026-02-04T20:30:00.000Z",
        text: "Margit finally went down tonight after more attempts than I want to admit. Ended up going away and levelling up Vigor and grabbing a couple of Sacred Tears before coming back, which made a bigger difference than any amount of pure practice. The relief when he actually stayed down was ridiculous for what is apparently just an early boss. Pushing into Stormveil properly now, the Grafted Scion fight at the very start makes a lot more sense in hindsight as a warning shot.",
        tags: [9, 5],
        gallery: [],
      },
    ],
  },
  {
    itemId: 6,
    title: "Stellar Blade",
    coverImage:
      "https://images.launchbox-app.com/r2_82127371-19db-4a53-98ed-fbcff731c893.jpg",
    cardImage:
      "https://images.launchbox-app.com/53aad796-f159-4423-92ae-b6ee0ac533a6.jpg",
    entries: [
      {
        entryId: 1,
        date: "2026-01-30T22:15:00.000Z",
        text: "Picked up Stellar Blade on a whim after seeing it on sale. Only had time for an hour but the combat already feels great — parry timing is tight without being unfair, and EVE moves with a real weight to her. Naytiba designs are properly unsettling in a good way. Going to need a proper controller session rather than picking it up in short bursts, some of the dodge windows feel like they need full attention.",
        tags: [3, 5],
        gallery: [],
      },
    ],
  },
  {
    itemId: 7,
    title: "Octopath Traveler II",
    coverImage:
      "https://images.launchbox-app.com/9370191c-f9ef-4832-bfa2-901afe8ac00e.jpg",
    cardImage:
      "https://images.launchbox-app.com/7dc45366-b0fc-4500-b739-b5e69502a4cb.jpg",
    entries: [
      {
        entryId: 1,
        date: "2026-03-16T19:30:00.000Z",
        text: "Started Octopath Traveler II after hearing so many people call it the best HD-2D game yet. Picked Castti as my lead since the medicine-mixing angle looked interesting on paper, and the travel banter with Partitio joining second is already really likeable. The day/night path action system is a nice evolution over the first game, having different options depending on when you approach an NPC opens up a lot of small character moments. Pixel art and lighting are stunning as always from this team.",
        tags: [4, 3],
        gallery: [
          "https://images.launchbox-app.com/e1f4f403-dff7-4bae-9f3d-25441008aad5.jpg",
          "https://images.launchbox-app.com/901d4853-bd7a-411c-a8d5-9c567f98b09f.jpg",
        ],
      },
    ],
  },
  {
    itemId: 8,
    title: "Granblue Fantasy: Relink",
    coverImage:
      "https://images.launchbox-app.com/7b952348-ca25-4a6c-aefd-c994ecdd1dcc.jpg",
    cardImage:
      "https://images.launchbox-app.com/0df5e096-afa2-4cf6-8424-99036a4a538d.jpg",
    entries: [
      {
        entryId: 1,
        date: "2025-12-22T22:00:00.000Z",
        text: "Christmas break project sorted — finally installed Granblue Fantasy Relink after hearing so much about it from Phil. The intro dump of lore is a lot to take in if you've never touched the mobile game, but the combat clicked almost instantly. Playing as Gran with Katalina and Rackam rounding out the party for now. The set pieces are doing a lot of heavy lifting visually, properly cinematic stuff. Already eyeing up how deep the character roster goes.",
        tags: [4, 3],
        gallery: [
          "https://images.launchbox-app.com/5fbccd91-f194-4bb9-a36e-ff93c4776a37.jpg",
          "https://images.launchbox-app.com/fc091c6a-4f96-4d4e-8002-03e4a7db8102.jpg",
        ],
      },
      {
        entryId: 2,
        date: "2026-02-28T21:30:00.000Z",
        text: "Deep into the post-game grind now, mostly just running Proto Bahamut over and over for drops — the guild calls it the 'endless ragnarok' loop and it's honestly exactly that. Same fight on repeat but the timing window for the final phase still gets my heart going every run. Finally got the last sigil piece I needed after what felt like the fiftieth attempt. Might actually be done with this one properly now, which feels strange after how much time's gone into it.",
        tags: [1, 9],
        gallery: [],
      },
    ],
  },
  {
    itemId: 10,
    title: "Pragmata",
    coverImage: "https://images8.alphacoders.com/140/thumb-1920-1407112.jpg",
    cardImage: "https://media.gamestop.com/i/gamestop/20006550-be099b16",
    entries: [
      {
        entryId: 1,
        date: "2026-03-16T19:30:00.000Z",
        text: "Started Pragmata on the new Switch 2 tonight after seeing it running well in the docked previews. The lunar base setting is gorgeous and properly unsettling in that quiet sci-fi way. The hacking puzzle layer bolted onto the third-person shooting is a strange combo on paper but it's clicking faster than expected — Diana solving the grid puzzles while you handle enemies in real time is a neat division of labour. Very early days but the atmosphere alone has me hooked.",
        tags: [4, 3],
        gallery: [
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3357650/9699288b90d0aad320e998f107b59edd27e9ea61/ss_9699288b90d0aad320e998f107b59edd27e9ea61.1920x1080.jpg",
        ],
      },
      {
        entryId: 2,
        date: "2026-03-20T10:00:00.000Z",
        text: "More Pragmata this morning before getting into anything else. The difficulty curve on the puzzle side is ramping up quicker than the combat side, had to properly stop and think through a couple of the hacking grids rather than solving them on reflex. Started piecing together some theories about what's actually going on with the moon base given how much the environmental storytelling is hinting at. Genuinely impressed by how it runs on Switch 2 docked, no obvious compromises so far.",
        tags: [5, 6],
        gallery: [],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Days
//
// Sorted oldest → newest. Track relies on this order for its circles.
// items[] here contains only { itemId, entryId } references — look up the
// full item record and its entry by joining against the items list above.
// ─────────────────────────────────────────────────────────────────────────────

export const sampleDaysData = [
  {
    dayId: 1,
    date: "2025-11-04T21:00:00.000Z",
    title: "",
    text: "First proper evening with Xenoblade 2. Been meaning to start this for ages and finally made the leap. The opening is a lot — characters, lore, names all thrown at you at once. But the world design is immediately striking, the cloud sea concept is unlike anything I've seen. Combat is completely opaque right now but I'm told it takes a few hours to click.",
    tags: [1, 4],
    items: [
      { itemId: 1, entryId: 1 },
      { itemId: 9, entryId: 1 },
    ],
  },
  {
    dayId: 2,
    date: "2025-11-11T20:30:00.000Z",
    title: "",
    text: "Good few hours on Xenoblade tonight. Combat is starting to make more sense — the flow arts and blade specials are clicking now. Got Nia in the party which is a big deal, she's immediately the most interesting character so far. The Mor Ardain section has been a highlight, the industrial aesthetic is a nice contrast to the organic stuff before it.",
    tags: [5],
    items: [
      { itemId: 1, entryId: 1 },
      { itemId: 9, entryId: 2 },
    ],
  },
  {
    dayId: 3,
    date: "2025-11-19T19:15:00.000Z",
    title: "",
    text: "Picked up Astral Chain in the sale. Haven't started it yet but wanted to log that it's in the queue. Spent most of tonight finishing off a few sidequests in Xenoblade instead — the Uraya region has some good ones. Bana is a brilliant villain, completely ridiculous in exactly the right way.",
    tags: [2],
    items: [
      { itemId: 1, entryId: 1 },
      { itemId: 9, entryId: 3 },
    ],
  },
  {
    dayId: 4,
    date: "2025-12-22T22:00:00.000Z",
    title: "Christmas break starts",
    text: "Off work now until January which means actual gaming time. Sat down with Xenoblade for a long session tonight — made it through the end of Chapter 4 which ended on a proper gut-punch moment. Didn't see it coming at all. The story is doing things I didn't expect from the opening hours. Good time to be playing this.",
    tags: [2, 4],
    items: [
      { itemId: 1, entryId: 2 },
      { itemId: 8, entryId: 1 },
    ],
  },
  {
    dayId: 5,
    date: "2025-12-28T16:00:00.000Z",
    title: "",
    text: "Lazy Sunday between Christmas and new year. Finally put a few hours into Astral Chain. The tone is completely different to what I expected — way more anime and stylised than the trailers suggested. Combat is satisfying once the Legion system clicks. The city hub sections have a nice investigative feel, reminds me a bit of Nier in how it builds the world quietly.",
    tags: [3],
    items: [
      { itemId: 2, entryId: 1 },
      { itemId: 9, entryId: 4 },
    ],
  },
  {
    dayId: 6,
    date: "2026-01-03T20:45:00.000Z",
    title: "Back to it",
    text: "New year, back to gaming properly. Spent the session on Xenoblade grinding some affinity with the Ursula blade — the trust system is slow but rewarding. Also did a bit of exploring in Leftheria which I'd been rushing through. The environmental variety in this game is genuinely impressive, every region feels distinct.",
    tags: [1, 5],
    items: [
      { itemId: 1, entryId: 1 },
      { itemId: 9, entryId: 5 },
    ],
  },
  {
    dayId: 7,
    date: "2026-01-07T21:00:00.000Z",
    title: "",
    text: "Chipped away at Astral Chain for a couple of hours. The combat is really opening up now — the chimera designs are getting more creative and the fights are starting to feel like puzzles. The sync attack system when you line up correctly with your legion is incredibly satisfying. This might be Platinum's best looking game.",
    tags: [3],
    items: [
      { itemId: 2, entryId: 1 },
      { itemId: 9, entryId: 6 },
    ],
  },
  {
    dayId: 8,
    date: "2026-01-11T19:00:00.000Z",
    title: "",
    text: "Ordered a PS1 and some games off eBay tonight. Been thinking about it for a while — there's a whole library I've never touched and emulation isn't the same. Got Xenogears, Parasite Eve and Vagrant Story in the lot. No RGB cable yet so I'll hold off starting any of them until it arrives.",
    tags: [3, 2],
    items: [{ itemId: 5, entryId: 1 }],
  },
  {
    dayId: 9,
    date: "2026-01-18T20:00:00.000Z",
    title: "",
    text: "Big session on Xenoblade. Finished Chapter 5 and pushed into 6. The tone has shifted noticeably — things are getting darker and the stakes feel real now. Rex's development has been gradual but it's paying off. Poppi QT Pi has completely replaced KOS-MOS in my main team composition, the customisation options are just better.",
    tags: [5, 4],
    items: [
      { itemId: 1, entryId: 2 },
      { itemId: 9, entryId: 7 },
    ],
  },
  {
    dayId: 10,
    date: "2026-01-24T21:30:00.000Z",
    title: "",
    text: "Astral Chain case file 7 done. The game keeps escalating in interesting ways — the chimeras are getting properly unsettling now. Found a few of the hidden items in the files that I'd completely missed on first pass. The investigation sections reward thoroughness in a way that doesn't feel tedious. Also dug out Crystal Bearers on the Wii for an hour before bed — hadn't touched it in years and was curious if it holds up.",
    tags: [5, 3],
    items: [
      { itemId: 2, entryId: 1 },
      { itemId: 9, entryId: 8 },
    ],
  },
  {
    dayId: 11,
    date: "2026-01-30T22:15:00.000Z",
    title: "",
    text: "PS1 arrived. Composite cables only for now so I can't start any of the NTSC games yet, the rainbow shimmer is too distracting. Had a look at the menus and tested it was working though. RGB cable is on order — apparently back in stock in February. Impatient but it's worth waiting for.",
    tags: [7, 3],
    items: [{ itemId: 6, entryId: 1 }],
  },
  {
    dayId: 12,
    date: "2026-02-04T20:30:00.000Z",
    title: "",
    text: "Finished Astral Chain. The final act goes completely off the rails in the best possible way — Platinum clearly saved the wildest ideas for the end. Credits rolled at about 30 hours. Not sure I'll go back for S ranks but I'm satisfied with where I ended up. Back to focusing on Xenoblade as the main game now.",
    tags: [5, 3],
    items: [
      { itemId: 2, entryId: 1 },
      { itemId: 5, entryId: 2 },
    ],
  },
  {
    dayId: 13,
    date: "2026-02-09T19:00:00.000Z",
    title: "",
    text: "Heavy Xenoblade session. Deep into the affinity charts now — this is the part everyone warns you about. Some of the field skill requirements are annoying but the blade content attached to them is genuinely good, lots of small stories you'd completely miss otherwise. Running the Switch Family Collective with a mate helps a lot for getting rare blades.",
    tags: [1, 2],
    items: [
      { itemId: 1, entryId: 1 },
      { itemId: 9, entryId: 9 },
    ],
  },
  {
    dayId: 14,
    date: "2026-02-15T21:00:00.000Z",
    title: "",
    text: "Started thinking seriously about what's next after Xenoblade. The queue is getting long — Xenogears obviously, then probably Vagrant Story or Parasite Eve. Also want to go back to something shorter and action-focused at some point, maybe Bayonetta or Devil May Cry 5. For now still very much in the middle of Xenoblade though.",
    tags: [3],
    items: [
      { itemId: 1, entryId: 3 },
      { itemId: 9, entryId: 10 },
    ],
  },
  {
    dayId: 15,
    date: "2026-02-22T20:00:00.000Z",
    title: "",
    text: "Made serious progress on the affinity charts tonight. Rex, Pyra, and Nia are all done. The endgame feels close — maybe five or six sessions away. Starting to feel bittersweet about finishing it, I've had this as my main game for months. Going to miss the routine of it.",
    tags: [5, 1],
    items: [
      { itemId: 1, entryId: 3 },
      { itemId: 9, entryId: 11 },
    ],
  },
  {
    dayId: 16,
    date: "2026-02-28T21:30:00.000Z",
    title: "",
    text: "RGB cable for the PS1 shipped — tracking says Tuesday. Almost done with the Xenoblade affinity work, just Zeke and Pandoria left which should be quick. Might line it up so I finish Xenoblade around the same time the cable arrives and I can start Xenogears as a clean handoff. That would be a good week.",
    tags: [3, 4],
    items: [
      { itemId: 1, entryId: 3 },
      { itemId: 8, entryId: 2 },
    ],
  },
  {
    dayId: 17,
    date: "2026-03-05T15:24:00.000Z",
    title: "Leeds Gaming Market",
    text: "Phil and Marc came over today for the gaming market downstairs. Finally bought my original PlayStation, got a chipped region-unlocked one so I can play Parasite Eve, Xenogears and all that. I'm gonna have to spend a bit to get them good quality but I've always wanted to play them. I need to get an RGB cable as well as the NTSC games have a mad rainbow looking filter on top, but I've found somewhere that does them and they're back in stock next month. Banging day anyway today, finished off with a Bundo as well 🤌",
    tags: [3, 8],
    items: [
      { itemId: 1, entryId: 1 },
      { itemId: 2, entryId: 1 },
    ],
  },
  {
    dayId: 18,
    date: "2026-03-08T20:10:00.000Z",
    title: "",
    text: "Quiet Sunday. Didn't do much today, cooked a big pasta in the afternoon and then just ended up on Xenoblade for most of the evening. Exactly the kind of day you need sometimes — no plans, no pressure, just the game. Chapter 7 delivered.",
    tags: [3, 4],
    items: [{ itemId: 1, entryId: 2 }],
  },
  {
    dayId: 19,
    date: "2026-03-12T21:45:00.000Z",
    title: "RGB cable arrived",
    text: "The RGB cable for the PS1 came almost a week early, wasn't expecting it until the weekend. Plugged it straight in and the difference is night and day — the rainbow interference is completely gone and everything looks sharp and saturated, exactly how it should look. Can't believe I nearly just put up with composite. Fired up Xenogears straight away and played for about two hours.",
    tags: [7, 2],
    items: [{ itemId: 3, entryId: 1 }],
  },
  {
    dayId: 20,
    date: "2026-03-16T19:30:00.000Z",
    title: "",
    text: "",
    tags: [],
    items: [
      { itemId: 3, entryId: 2 },
      { itemId: 4, entryId: 1 },
      { itemId: 7, entryId: 1 },
      { itemId: 10, entryId: 1 },
    ],
  },
  {
    dayId: 21,
    date: "2026-03-20T10:00:00.000Z",
    title: "Morning gaming, then dev",
    text: "Started the morning with some Xenoblade before doing anything else, which is always a good sign for the day. Spent the afternoon doing some work on the journal app — got the PWA manifest set up so it can be saved to the home screen properly and opens without the Safari bar. Feels way more like a real app now. Small detail but it matters.",
    tags: [3, 2],
    items: [
      { itemId: 1, entryId: 3 },
      { itemId: 3, entryId: 1 },
      { itemId: 4, entryId: 2 },
      { itemId: 10, entryId: 2 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Toggle: sample content vs. a genuinely blank start
//
// AppContext's initialState (and its HYDRATE fallback) run whatever comes
// out of daysData/itemsData through ensureSeedData, which seeds one blank
// day and one blank item whenever it's handed empty arrays (tagsData has no
// such fallback — an empty tag list is just a genuinely empty tag list, no
// seeding needed). Switching between the bundled sample content above and a
// real blank start is just one line each: point at sample*Data to bring it
// back, or [] to start blank.

// export const daysData = sampleDaysData;
// export const itemsData = sampleItemsData;
// export const tagsData = sampleTagsData;
export const daysData = [];
export const itemsData = [];
export const tagsData = [];
