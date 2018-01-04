exports.seed = async function(knex, promise){
  const tournamentTask = (async () => {
    await knex('tournaments').del();
    return knex('tournaments').returning('*').insert([
      {name: 'Test Tournament', description: 'My tournament for testing', no_of_teams: 8, creator_user_id: 54, is_started: false, twitch_channel: 'WhtMage'}
    ]);
  })();

  const usersTask = (async () => {
    await knex('users').del();
    return knex('users').returning('*').insert([
      {email:'aaaa@aifhiaw.com',password:'123456',battlenet_id:'Zorphy-2615'},
      {email:'pfa7u7.n0v7_iin@iw2fv4.com',password:'password',battlenet_id:'Snacks-1549'},
      {email:'28xmm0jsmpsf-@lfkh1eg9.com',password:'password',battlenet_id:'DevilFire-2182'},
      {email:'g-jmucg@92atcmqm4.com',password:'password',battlenet_id:'Incinirator-2709'},
      {email:'k0zwc-65c.2p@s6m2g64m3un.com',password:'password',battlenet_id:'Domer-1861'},
      {email:'23_tt1@4pmnrkgjmf.com',password:'password',battlenet_id:'Strakt-1429'},
      {email:'z6bp_9hm13z_on2@m6haywmadwh.com',password:'password',battlenet_id:'TheRancor-1628'},
      {email:'nk1.d3o@bxunlkajyn0z.com',password:'password',battlenet_id:'SneezyDwarf-2272'},
      {email:'a95n08@aeh9rrw.com',password:'password',battlenet_id:'Belzac-2748'},
      {email:'n7x_p_k1@atmnsmwym.com',password:'password',battlenet_id:'JaegerMist-2194'},
      {email:'2qm1uux..@iquujgtye.com',password:'password',battlenet_id:'Priscilla-2836'},
      {email:'em2s7bdspx-da@j3t3ot2w.com',password:'password',battlenet_id:'Catsuki-2808'},
      {email:'gis29xsj36-iy_m@en8bq8ki.com',password:'password',battlenet_id:'Pranja-2634'},
      {email:'x_6i0eof@vcbhuk.com',password:'password',battlenet_id:'Chad-2890'},
      {email:'ifahrevng.kri2t@5ylcvpq1.com',password:'password',battlenet_id:'DragonhandX-1992'},
      {email:'5id@bgqjlqq3u.com',password:'password',battlenet_id:'Dae-2714'},
      {email:'3.phid2b4admrvc@rc5ze7.com',password:'password',battlenet_id:'kin3ticz-1322'},
      {email:'fgbw-xvcmvru4v@h4ki8xyqze.com',password:'password',battlenet_id:'ToxicWaste-1182'},
      {email:'7yp2iu8jd@55y7fhmz0.com',password:'password',battlenet_id:'Xstyle-2757'},
      {email:'4gez65dt0wa3ip@qp9lybesz-y8.com',password:'password',battlenet_id:'SpriteGuy-1178'},
      {email:'8iixpmk@hdnza9z2.com',password:'password',battlenet_id:'Vinyl-2457'},
      {email:'gwbsj@cw12wn.com',password:'password',battlenet_id:'Marvellous-1896'},
      {email:'2tf0evjo3m3@pmyec5ijpj1x.com',password:'password',battlenet_id:'Kekmate-2741'},
      {email:'oc-328@qhanluvz.com',password:'password',battlenet_id:'Jeffurs0-1909'},
      {email:'p3kd7m@8cvlll0xxlzu.com',password:'password',battlenet_id:'Blasterboy-1935'},
      {email:'qtw@p67-qujn.com',password:'password',battlenet_id:'DaSerb-1613'},
      {email:'yb7_-9vki8i7tut@bv7rdr89m7n7.com',password:'password',battlenet_id:'CaptainHelps-1632'},
      {email:'8fo9@0m567dc1l8h.com',password:'password',battlenet_id:'Monorion-2810'},
      {email:'kql3t4yqeu6.1@u64813iu.com',password:'password',battlenet_id:'PHILLOUS-2795'},
      {email:'z27-xb5blhn@azdyeh.com',password:'password',battlenet_id:'Shadowgamerz-2632'},
      {email:'7cdu2@7ytv8.com',password:'password',battlenet_id:'Demandred-2245'},
      {email:'hz018pynlm16p@85t-ah6cko5g.com',password:'password',battlenet_id:'FroNinja-2991'},
      {email:'4_f@1f4x5yaq.com',password:'password',battlenet_id:'Sulfater-1820'},
      {email:'5zfgv_2u_0oah57@n5ge4l69.com',password:'password',battlenet_id:'Taureli-2810'},
      {email:'34th@250p0f086.com',password:'password',battlenet_id:'Rixoxis-2515'},
      {email:'399-z2ls0@pjikgm29die.com',password:'password',battlenet_id:'Biefrey-1402'},
      {email:'dj.ih9c246wy4@imb1jr.com',password:'password',battlenet_id:'AvinGaming-2271'},
      {email:'4g6sd92i24l_3uf@wv6nop-fy.com',password:'password',battlenet_id:'Kiino-2199'},
      {email:'owznbpt@67v2w4q.com',password:'password',battlenet_id:'Galforetress-1863'},
      {email:'pcxv1hp@cw5b2s.com',password:'password',battlenet_id:'CycloneJoker-1517'},
      {email:'8_xhaa1@68jvsbb5ep81.com',password:'password',battlenet_id:'Wladziu-2906'},
      {email:'duncand@yahoo.ca',password:'password',battlenet_id:'Graez-1106'},
      {email:'pakaste@att.net',password:'password',battlenet_id:'Jehuty-1725'},
      {email:'dwsauder@me.com',password:'password',battlenet_id:'Renos-2267'},
      {email:'johnh@msn.com',password:'password',battlenet_id:'Deathshade-1160'},
      {email:'valdez@verizon.net',password:'password',battlenet_id:'shinydog-1601'},
      {email:'bachmann@att.net',password:'password',battlenet_id:'Prismo-1112'},
      {email:'jimmichie@mac.com',password:'password',battlenet_id:'Hydration-1570'},
      {email:'amaranth@hotmail.com',password:'password',battlenet_id:'JohnnyQuest-1865'},
      {email:'mthurn@icloud.com',password:'password',battlenet_id:'Thaetus-1914'},
      {email:'report@gmail.com',password:'password',battlenet_id:'Shockolate-2170'},
      {email:'pplinux@hotmail.com',password:'password',battlenet_id:'Maelstrom-1152'},
      {email:'seemant@mac.com',password:'password',battlenet_id:'Cah-1674'}
    ]);
  })();
  const teamsTask = (async () => {
    const [tournament] = await tournamentTask;
    const tournament_id = tournament.id;
    await knex('teams').del();
    return knex('teams').insert([
      {tournament_id},
      {tournament_id},
      {tournament_id},
      {tournament_id},
      {tournament_id},
      {tournament_id},
      {tournament_id},
      {tournament_id},
    ]);
  })();
  const tournament_enrollmentTask = (async () => {
    const [tournament] = await tournamentTask;
    const tournament_id = tournament.id;
    console.log('Tournement ID, ' + tournament_id);
    const users = await usersTask;
    await knex('enrollments').del();
    return knex('enrollments').insert([
    {user_id:users[0].id,tournament_id,level:2,first_role:'defense',first_role_time_played:103860000,second_role:'offense',second_role_time_played:71220000,medal_gold:709,medal_silver:592,medal_bronze:468,games_won:365,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000009EB.png',role_summary: '[{"role":"defense","time":103860000},{"role":"offense","time":71220000},{"role":"tank","time":42000000},{"role":"support","time":37560000}]'},
    {user_id:users[1].id,tournament_id,level:12,first_role:'offense',first_role_time_played:187200000,second_role:'defense',second_role_time_played:144000000,medal_gold:1131,medal_silver:1087,medal_bronze:899,games_won:802,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008E8.png',role_summary: '[{"role":"defense","time":12180000},{"role":"offense","time":11520000},{"role":"support","time":6600000},{"role":"tank","time":5880000}]'},
    {user_id:users[2].id,tournament_id,level:80,first_role:'offense',first_role_time_played:156780000,second_role:'tank',second_role_time_played:65880000,medal_gold:1044,medal_silver:692,medal_bronze:452,games_won:371,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000F06.png',role_summary: '[{"role":"defense","time":16020000},{"role":"offense","time":13920000},{"role":"tank","time":11460000},{"role":"support","time":9060034.240759432}]'},
    {user_id:users[3].id,tournament_id,level:50,first_role:'offense',first_role_time_played:89820000,second_role:'tank',second_role_time_played:60000000,medal_gold:630,medal_silver:581,medal_bronze:486,games_won:307,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000D75.png',role_summary: '[{"role":"defense","time":190800000},{"role":"offense","time":183600000},{"role":"tank","time":144480000},{"role":"support","time":108000000}]'},
    {user_id:users[4].id,tournament_id,level:78,first_role:'offense',first_role_time_played:281580000,second_role:'defense',second_role_time_played:111600000,medal_gold:1300,medal_silver:1254,medal_bronze:1121,games_won:709,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000D70.png',role_summary: '[{"role":"defense","time":57720000},{"role":"offense","time":50400000},{"role":"tank","time":21180000},{"role":"support","time":17340000}]'},
    {user_id:users[5].id,tournament_id,level:13,first_role:'offense',first_role_time_played:205260000,second_role:'tank',second_role_time_played:188580000,medal_gold:1283,medal_silver:1226,medal_bronze:1029,games_won:690,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000114B.png',role_summary: '[{"role":"defense","time":65940000},{"role":"tank","time":57300000},{"role":"support","time":24480000},{"role":"offense","time":12300000}]'},
    {user_id:users[6].id,tournament_id,level:67,first_role:'support',first_role_time_played:296040000,second_role:'tank',second_role_time_played:181200000,medal_gold:1763,medal_silver:1302,medal_bronze:1078,games_won:859,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001195.png',role_summary: '[{"role":"offense","time":112080000},{"role":"defense","time":77940000},{"role":"tank","time":18240000},{"role":"support","time":9000000}]'},
    {user_id:users[7].id,tournament_id,level:18,first_role:'offense',first_role_time_played:64800000,second_role:'support',second_role_time_played:63840000,medal_gold:602,medal_silver:475,medal_bronze:434,games_won:308,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000A92.png',role_summary: '[{"role":"offense","time":117060000},{"role":"defense","time":73500000},{"role":"tank","time":60840000},{"role":"support","time":25920000}]'},
    {user_id:users[8].id,tournament_id,level:69,first_role:'defense',first_role_time_played:57720000,second_role:'offense',second_role_time_played:50400000,medal_gold:475,medal_silver:404,medal_bronze:332,games_won:213,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000C22.png',role_summary: '[{"role":"offense","time":132000000},{"role":"defense","time":123180000},{"role":"tank","time":35700000},{"role":"support","time":13680000}]'},
    {user_id:users[9].id,tournament_id,level:64,first_role:'tank',first_role_time_played:244800000,second_role:'support',second_role_time_played:159660000,medal_gold:1371,medal_silver:1338,medal_bronze:1283,games_won:790,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000139B.png',role_summary: '[{"role":"offense","time":1321200000},{"role":"tank","time":344040000},{"role":"support","time":338400000},{"role":"defense","time":59460000}]'},
    {user_id:users[10].id,tournament_id,level:12,first_role:'offense',first_role_time_played:175260000,second_role:'defense',second_role_time_played:122400000,medal_gold:1289,medal_silver:946,medal_bronze:707,games_won:540,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008C1.png',role_summary: '[{"role":"offense","time":162000000},{"role":"defense","time":100800000},{"role":"tank","time":88080000},{"role":"support","time":39900000}]'},
    {user_id:users[11].id,tournament_id,level:38,first_role:'support',first_role_time_played:25860000,second_role:'tank',second_role_time_played:21300000,medal_gold:278,medal_silver:215,medal_bronze:182,games_won:116,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000005CD.png',role_summary: '[{"role":"offense","time":172500000},{"role":"tank","time":141900000},{"role":"support","time":73140000},{"role":"defense","time":68400000}]'},
    {user_id:users[12].id,tournament_id,level:59,first_role:'defense',first_role_time_played:190800000,second_role:'offense',second_role_time_played:183600000,medal_gold:1600,medal_silver:1421,medal_bronze:1263,games_won:838,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001159.png',role_summary: '[{"role":"offense","time":172800000},{"role":"defense","time":151200000},{"role":"support","time":37200000},{"role":"tank","time":16800000}]'},
    {user_id:users[13].id,tournament_id,level:29,first_role:'tank',first_role_time_played:68880000,second_role:'offense',second_role_time_played:63480000,medal_gold:804,medal_silver:605,medal_bronze:456,games_won:341,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000577.png',role_summary: '[{"role":"offense","time":175260000},{"role":"defense","time":122400000},{"role":"support","time":79200000},{"role":"tank","time":57600000}]'},
    {user_id:users[14].id,tournament_id,level:5,first_role:'tank',first_role_time_played:112260000,second_role:'defense',second_role_time_played:68700000,medal_gold:480,medal_silver:492,medal_bronze:435,games_won:285,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000006D0.png',role_summary: '[{"role":"offense","time":187200000},{"role":"defense","time":144000000},{"role":"tank","time":75780000},{"role":"support","time":43860000}]'},
    {user_id:users[15].id,tournament_id,level:46,first_role:'offense',first_role_time_played:172500000,second_role:'tank',second_role_time_played:141900000,medal_gold:1382,medal_silver:1146,medal_bronze:890,games_won:635,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000BB0.png',role_summary: '[{"role":"offense","time":205260000},{"role":"tank","time":188580000},{"role":"defense","time":121200000},{"role":"support","time":58800000}]'},
    {user_id:users[16].id,tournament_id,level:81,first_role:'defense',first_role_time_played:9540000,second_role:'tank',second_role_time_played:5100000,medal_gold:73,medal_silver:69,medal_bronze:36,games_won:25,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000012D9.png',role_summary: '[{"role":"offense","time":281580000},{"role":"defense","time":111600000},{"role":"tank","time":109080000},{"role":"support","time":86400000}]'},
    {user_id:users[17].id,tournament_id,level:82,first_role:'support',first_role_time_played:173640000,second_role:'tank',second_role_time_played:58560000,medal_gold:815,medal_silver:448,medal_bronze:391,games_won:340,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008EC.png',role_summary: '[{"role":"offense","time":408840000},{"role":"tank","time":49440000},{"role":"support","time":27720000},{"role":"defense","time":12360000}]'},
    {user_id:users[18].id,tournament_id,level:20,first_role:'offense',first_role_time_played:408840000,second_role:'tank',second_role_time_played:49440000,medal_gold:1804,medal_silver:1062,medal_bronze:899,games_won:629,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000010B9.png',role_summary: '[{"role":"offense","time":41100000},{"role":"defense","time":33420000},{"role":"tank","time":32160000},{"role":"support","time":20280000}]'},
    {user_id:users[19].id,tournament_id,level:90,first_role:'tank',first_role_time_played:288000000,second_role:'support',second_role_time_played:241200000,medal_gold:2753,medal_silver:2052,medal_bronze:1790,games_won:1241,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000ABC.png',role_summary: '[{"role":"offense","time":48480000},{"role":"tank","time":22560000},{"role":"support","time":7200000},{"role":"defense","time":2580000}]'},
    {user_id:users[20].id,tournament_id,level:50,first_role:'tank',first_role_time_played:187200000,second_role:'support',second_role_time_played:156120000,medal_gold:1355,medal_silver:1216,medal_bronze:1106,games_won:748,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000113E.png',role_summary: '[{"role":"offense","time":64620000},{"role":"defense","time":62100000},{"role":"tank","time":54000000},{"role":"support","time":14460000}]'},
    {user_id:users[21].id,tournament_id,level:34,first_role:'offense',first_role_time_played:172800000,second_role:'defense',second_role_time_played:151200000,medal_gold:709,medal_silver:806,medal_bronze:686,games_won:445,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000139D.png',role_summary: '[{"role":"offense","time":86400000},{"role":"support","time":79200000},{"role":"tank","time":64800000},{"role":"defense","time":39600000}]'},
    {user_id:users[22].id,tournament_id,level:31,first_role:'defense',first_role_time_played:16020000,second_role:'offense',second_role_time_played:13920000,medal_gold:149,medal_silver:142,medal_bronze:102,games_won:68,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001398.png',role_summary: '[{"role":"offense","time":89820000},{"role":"tank","time":60000000},{"role":"defense","time":53160000},{"role":"support","time":39840000}]'},
    {user_id:users[23].id,tournament_id,level:89,first_role:'tank',first_role_time_played:108000000,second_role:'offense',second_role_time_played:41160000,medal_gold:768,medal_silver:613,medal_bronze:476,games_won:293,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008C5.png',role_summary: '[{"role":"offense","time":90240000},{"role":"tank","time":51600000},{"role":"defense","time":46020000},{"role":"support","time":40620000}]'},
    {user_id:users[24].id,tournament_id,level:99,first_role:'offense',first_role_time_played:90240000,second_role:'tank',second_role_time_played:51600000,medal_gold:705,medal_silver:563,medal_bronze:425,games_won:306,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000113E.png',role_summary: '[{"role":"support","time":125640000},{"role":"tank","time":93600000},{"role":"defense","time":61260000},{"role":"offense","time":15540000}]'},
    {user_id:users[25].id,tournament_id,level:13,first_role:'offense',first_role_time_played:124680000,second_role:'tank',second_role_time_played:75600000,medal_gold:558,medal_silver:573,medal_bronze:513,games_won:337,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000011DD.png',role_summary: '[{"role":"support","time":25860000},{"role":"tank","time":21300000},{"role":"defense","time":18060000},{"role":"offense","time":17280000}]'},
    {user_id:users[26].id,tournament_id,level:75,first_role:'tank',first_role_time_played:54420000,second_role:'defense',second_role_time_played:17700000,medal_gold:308,medal_silver:281,medal_bronze:231,games_won:142,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000009E4.png',role_summary: '[{"role":"support","time":270840000},{"role":"tank","time":28140000},{"role":"offense","time":27300000},{"role":"defense","time":18900000}]'},
    {user_id:users[27].id,tournament_id,level:20,first_role:'defense',first_role_time_played:10860000,second_role:'offense',second_role_time_played:6600000,medal_gold:61,medal_silver:59,medal_bronze:68,games_won:45,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000318.png',role_summary: '[{"role":"support","time":36600000},{"role":"offense","time":16380000},{"role":"defense","time":5400000},{"role":"tank","time":3300000}]'},
    {user_id:users[28].id,tournament_id,level:62,first_role:'offense',first_role_time_played:36000000,second_role:'tank',second_role_time_played:30600000,medal_gold:322,medal_silver:299,medal_bronze:304,games_won:170,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008C0.png',role_summary: '[{"role":"support","time":75180000},{"role":"tank","time":32220000},{"role":"offense","time":19500000},{"role":"defense","time":15720000}]'},
    {user_id:users[29].id,tournament_id,level:68,first_role:'defense',first_role_time_played:65940000,second_role:'tank',second_role_time_played:57300000,medal_gold:417,medal_silver:420,medal_bronze:304,games_won:198,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008F2.png',role_summary: '[{"role":"tank","time":108000000},{"role":"offense","time":41160000},{"role":"support","time":36000000},{"role":"defense","time":34200000}]'},
    {user_id:users[30].id,tournament_id,level:17,first_role:'support',first_role_time_played:125640000,second_role:'tank',second_role_time_played:93600000,medal_gold:844,medal_silver:623,medal_bronze:513,games_won:396,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000F03.png',role_summary: '[{"role":"tank","time":187200000},{"role":"support","time":156120000},{"role":"offense","time":136800000},{"role":"defense","time":111600000}]'},
    {user_id:users[31].id,tournament_id,level:5,first_role:'defense',first_role_time_played:464400000,second_role:'offense',second_role_time_played:399600000,medal_gold:2520,medal_silver:2089,medal_bronze:1761,games_won:1110,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000114B.png',role_summary: '[{"role":"tank","time":234000000},{"role":"support","time":219600000},{"role":"defense","time":201600000},{"role":"offense","time":175320000}]'},
    {user_id:users[32].id,tournament_id,level:82,first_role:'support',first_role_time_played:75180000,second_role:'tank',second_role_time_played:32220000,medal_gold:374,medal_silver:272,medal_bronze:289,games_won:203,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008C2.png',role_summary: '[{"role":"tank","time":266400000},{"role":"offense","time":238980000},{"role":"defense","time":177120000},{"role":"support","time":132540000}]'},
    {user_id:users[33].id,tournament_id,level:64,first_role:'offense',first_role_time_played:41100000,second_role:'defense',second_role_time_played:33420000,medal_gold:410,medal_silver:287,medal_bronze:270,games_won:170,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000BBC.png',role_summary: '[{"role":"tank","time":36720000},{"role":"defense","time":28020000},{"role":"offense","time":18720000},{"role":"support","time":7080000}]'},
    {user_id:users[34].id,tournament_id,level:57,first_role:'offense',first_role_time_played:162000000,second_role:'defense',second_role_time_played:100800000,medal_gold:1231,medal_silver:1011,medal_bronze:795,games_won:540,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001195.png',role_summary: '[{"role":"tank","time":58620000},{"role":"offense","time":52680000},{"role":"support","time":30420000},{"role":"defense","time":27900000}]'},
    {user_id:users[35].id,tournament_id,level:81,first_role:'offense',first_role_time_played:64620000,second_role:'defense',second_role_time_played:62100000,medal_gold:446,medal_silver:503,medal_bronze:433,games_won:254,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000008C5.png',role_summary: '[{"role":"tank","time":68880000},{"role":"offense","time":63480000},{"role":"support","time":57600000},{"role":"defense","time":45600000}]'},
    {user_id:users[36].id,tournament_id,level:60,first_role:'offense',first_role_time_played:52980000,second_role:'defense',second_role_time_played:28800000,medal_gold:189,medal_silver:258,medal_bronze:262,games_won:141,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000BB1.png',role_summary: '[{"role":"tank","time":78360000},{"role":"defense","time":55740000},{"role":"offense","time":54300000},{"role":"support","time":38100000}]'},
    {user_id:users[37].id,tournament_id,level:68,first_role:'offense',first_role_time_played:103860000,second_role:'support',second_role_time_played:90600000,medal_gold:617,medal_silver:677,medal_bronze:692,games_won:435,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x025000000000139F.png',role_summary: '[{"role":"support","time":36600000},{"role":"offense","time":16380000},{"role":"defense","time":5400000},{"role":"tank","time":3300000}]'},
    {user_id:users[38].id,tournament_id,level:17,first_role:'tank',first_role_time_played:230400000,second_role:'support',second_role_time_played:216000000,medal_gold:2267,medal_silver:1961,medal_bronze:1653,games_won:1104,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001398.png',role_summary: '[{"role":"support","time":75180000},{"role":"tank","time":32220000},{"role":"offense","time":19500000},{"role":"defense","time":15720000}]'},
    {user_id:users[39].id,tournament_id,level:41,first_role:'offense',first_role_time_played:209400000,second_role:'defense',second_role_time_played:198000000,medal_gold:1284,medal_silver:1289,medal_bronze:1254,games_won:811,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001153.png',role_summary: '[{"role":"tank","time":108000000},{"role":"offense","time":41160000},{"role":"support","time":36000000},{"role":"defense","time":34200000}]'},
    {user_id:users[40].id,tournament_id,level:87,first_role:'tank',first_role_time_played:78360000,second_role:'defense',second_role_time_played:55740000,medal_gold:349,medal_silver:426,medal_bronze:454,games_won:272,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000010B8.png',role_summary: '[{"role":"tank","time":187200000},{"role":"support","time":156120000},{"role":"offense","time":136800000},{"role":"defense","time":111600000}]'},
    {user_id:users[41].id,tournament_id,level:34,first_role:'offense',first_role_time_played:117060000,second_role:'defense',second_role_time_played:73500000,medal_gold:884,medal_silver:790,medal_bronze:609,games_won:374,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000BB3.png',role_summary: '[{"role":"tank","time":234000000},{"role":"support","time":219600000},{"role":"defense","time":201600000},{"role":"offense","time":175320000}]'},
    {user_id:users[42].id,tournament_id,level:13,first_role:'offense',first_role_time_played:112080000,second_role:'defense',second_role_time_played:77940000,medal_gold:497,medal_silver:473,medal_bronze:455,games_won:303,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000001195.png',role_summary: '[{"role":"tank","time":266400000},{"role":"offense","time":238980000},{"role":"defense","time":177120000},{"role":"support","time":132540000}]'},
    {user_id:users[43].id,tournament_id,level:23,first_role:'support',first_role_time_played:270840000,second_role:'tank',second_role_time_played:28140000,medal_gold:885,medal_silver:534,medal_bronze:549,games_won:460,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000577.png',role_summary: '[{"role":"tank","time":36720000},{"role":"defense","time":28020000},{"role":"offense","time":18720000},{"role":"support","time":7080000}]'},
    {user_id:users[44].id,tournament_id,level:39,first_role:'support',first_role_time_played:36600000,second_role:'offense',second_role_time_played:16380000,medal_gold:160,medal_silver:100,medal_bronze:91,games_won:78,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000004F4.png',role_summary: '[{"role":"tank","time":58620000},{"role":"offense","time":52680000},{"role":"support","time":30420000},{"role":"defense","time":27900000}]'},
    {user_id:users[45].id,tournament_id,level:91,first_role:'tank',first_role_time_played:51840000,second_role:'offense',second_role_time_played:28860000,medal_gold:343,medal_silver:327,medal_bronze:327,games_won:185,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x02500000000009DA.png',role_summary: '[{"role":"tank","time":68880000},{"role":"offense","time":63480000},{"role":"support","time":57600000},{"role":"defense","time":45600000}]'},
    {user_id:users[46].id,tournament_id,level:89,first_role:'offense',first_role_time_played:1317600000,second_role:'tank',second_role_time_played:344040000,medal_gold:6403,medal_silver:4500,medal_bronze:3307,games_won:2417,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000C3F.png',role_summary: '[{"role":"tank","time":78360000},{"role":"defense","time":55740000},{"role":"offense","time":54300000},{"role":"support","time":38100000}]'},
    {user_id:users[47].id,tournament_id,level:100,first_role:'support',first_role_time_played:132000000,second_role:'offense',second_role_time_played:123180000,medal_gold:1049,medal_silver:701,medal_bronze:532,games_won:425,avatar:'https://d1u1mce87gyfbn.cloudfront.net/game/unlocks/0x0250000000000B3B.png',role_summary: '[{"role":"support","time":36600000},{"role":"offense","time":16380000},{"role":"defense","time":5400000},{"role":"tank","time":3300000}]'},
    ]);
  })();
  const highlightsTask = (async () => {
    const [tournament] = await tournamentTask;
    const tournament_id = tournament.id;
    await knex('highlights').del();
    return knex('highlights').insert([
      {tournament_id, name: 'Video 1', url: 'eWbroN1QORk'},
      {tournament_id, name: 'Video 2', url: '2X4IRPnKAGk'},
      {tournament_id, name: 'Video 3', url: 'jRC9RxqwPJ0'},
    ]);
  })();
  await usersTask;
  await teamsTask;
  await tournamentTask;
  await tournament_enrollmentTask;
  await highlightsTask;
};
