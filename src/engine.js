/* Promo Bed Composer, genre engine v3.
   Deterministic: music-theory rules, genre blueprints, seeded choices and the voice read's analysis. No AI, no machine learning.
   Every instrument is a real recording (acoustic instruments, electric pianos, and recordings of real synth hardware). */
(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),db=x=>10**(x/20),mod=(a,n)=>(a%n+n)%n;
const rng=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const tools=R=>({R,pick:a=>a[R()*a.length|0],ch:p=>R()<p,rg:(a,b)=>a+(b-a)*R(),g:()=>(R()+R()+R()+R()-2)/.577,
  w:o=>{let s=0;for(const k in o)s+=o[k];let x=R()*s;for(const k in o){x-=o[k];if(x<=0)return k}return Object.keys(o)[0]}});
const merge=(a,b)=>{if(!b)return a;const o={...a};for(const k in b)o[k]=b[k]&&typeof b[k]=='object'&&!Array.isArray(b[k])&&a&&typeof a[k]=='object'?merge(a[k],b[k]):b[k];return o};

/* ---------- instrument catalogue: [display name, sample set(s) (soft, hard), folder, kind, low, high] ---------- */
const INS={
 // real hardware synthesizers, multisampled by Public Samples (public-domain dedication)
 a4_blip:['Elektron Analog Four bass (“Blip Bass”)','a4_blip','sy','synbass',22,56],
 a4_fm:['Elektron Analog Four FM (“Pleasing FM”)','a4_fm','sy','mallet',48,101],
 a4_gritpad:['Elektron Analog Four pad (“Grit Pad”)','a4_gritpad','sy','synpad',22,64],
 a4_stacker:['Elektron Analog Four stack (“Stacker”)','a4_stacker','sy','saw',32,64],
 aj_chsaw:['Roland Alpha Juno chorus saw (“Chorus Saw 1”)','aj_chsaw','sy','saw',10,64],
 aj_saw:['Roland Alpha Juno saw (“No Res Saw 1”)','aj_saw','sy','saw',28,70],
 aj_sq:['Roland Alpha Juno square (“No Res Square 1”)','aj_sq','sy','saw',28,70],
 cp_bigbad:['Rhodes Chroma Polaris saw stack (“BigBad Stack Pitch”)','cp_bigbad','sy','saw',22,76],
 cp_hollow:['Rhodes Chroma Polaris pad (“Hollow Pad”)','cp_hollow','sy','synpad',20,76],
 cp_pwbass:['Rhodes Chroma Polaris bass (“PWBass”)','cp_pwbass','sy','synbass',22,68],
 cp_pwmstack:['Rhodes Chroma Polaris PWM pad (“PWMPad Stack”)','cp_pwmstack','sy','synpad',32,88],
 cp_sawfilt:['Rhodes Chroma Polaris saw (“SawFilter1x”)','cp_sawfilt','sy','synthpluck',28,77],
 cp_wow:['Rhodes Chroma Polaris lead (“WowLead”)','cp_wow','sy','synlead',44,89],
 esq_bass:['Ensoniq ESQ-1 bass (“Nasty Bass”)','esq_bass','sy','synbass',22,56],
 esq_bell:['Ensoniq ESQ-1 bell (“Smell Bell”)','esq_bell','sy','mallet',36,89],
 esq_detune:['Ensoniq ESQ-1 pad (“Detuned Pad”)','esq_detune','sy','synpad',22,80],
 esq_ep:['Ensoniq ESQ-1 electric piano (“Electric Piano”)','esq_ep','sy','synth',34,97],
 hs_plastic:['Roland HS-80 bass (“Plastic Bass”)','hs_plastic','sy','synbass',10,44],
 hs_vs:['Roland HS-80 pad (“Vs Pad”)','hs_vs','sy','synpad',22,80],
 j6_new:['Roland Juno-6 pad (“New Pad”)','j6_new','sy','synpad',34,92],
 j6_open:['Roland Juno-6 pad (“Open Pad”)','j6_open','sy','synpad',22,80],
 j6_pulse:['Roland Juno-6 bass (“Pulse Bass”)','j6_pulse','sy','synbass',22,56],
 j6_pwpl:['Roland Juno-6 pluck (“PW Pluck”)','j6_pwpl','sy','synthpluck',36,99],
 j6_rich:['Roland Juno-6 pluck (“Rich pluck”)','j6_rich','sy','synthpluck',36,99],
 j6_short:['Roland Juno-6 bass (“Short Bass”)','j6_short','sy','synbass',10,44],
 jd_bright:['Roland JD-800 lead (“Bright Lead”)','jd_bright','sy','synlead',44,99],
 jd_digi:['Roland JD-800 digital keys (“JDdigi”)','jd_digi','sy','synth',22,84],
 jd_orange:['Roland JD-800 lead (“Orange Lead”)','jd_orange','sy','synlead',32,87],
 jd_pad:['Roland JD-800 pad (“Obvious Pad”)','jd_pad','sy','synpad',22,56],
 jd_pluck:['Roland JD-800 pluck (“Multi-pluck”)','jd_pluck','sy','synthpluck',36,99],
 jp4_bold:['Roland Jupiter-4 lead (“Bold Lead”)','jp4_bold','sy','synlead',34,86],
 jp4_brass:['Roland Jupiter-4 synth brass (“Baby brass”)','jp4_brass','sy','synbrass',36,88],
 jp4_lead:['Roland Jupiter-4 lead (“JP lead”)','jp4_lead','sy','synlead',32,77],
 jp4_piano:['Roland Jupiter-4 synth piano (“Roger Piano”)','jp4_piano','sy','synth',34,89],
 jp4_pwm:['Roland Jupiter-4 PWM strings (“PWM Strings”)','jp4_pwm','sy','synpad',22,80],
 jp4_unison:['Roland Jupiter-4 unison pad (“Unison Pad”)','jp4_unison','sy','synpad',34,80],
 jp4_vikings:['Roland Jupiter-4 pad (“Vikings Pad”)','jp4_vikings','sy','synpad',34,80],
 jx8_dark:['Roland JX-8P pad (“Dark Pad Chorus”)','jx8_dark','sy','synpad',22,80],
 jx_big:['Roland JX-3P (“BigJX”)','jx_big','sy','saw',22,82],
 jx_piano:['Roland JX-3P piano (“DCO Piano”)','jx_piano','sy','synth',22,83],
 jx_rave:['Roland JX-3P rave stab (“Rave Stabbing”)','jx_rave','sy','synthpluck',12,67],
 jx_rounder:['Roland JX-3P bass (“RounderBass”)','jx_rounder','sy','synbass',10,45],
 jx_snap:['Roland JX-3P bass (“SnapBass”)','jx_snap','sy','synbass',10,44],
 jx_strings:['Roland JX-3P strings (“On Off Strings”)','jx_strings','sy','synpad',22,80],
 k3_ep:['Kawai K3 electric piano (“K3 E Piano”)','k3_ep','sy','synth',45,88],
 k3_gentle:['Kawai K3 pad (“Gentle Pad”)','k3_gentle','sy','synpad',20,80],
 k3_solid:['Kawai K3 bass (“Solid Bass”)','k3_solid','sy','synbass',10,44],
 k3_wobble:['Kawai K3 wobble bass (“Bass Wobble”)','k3_wobble','sy','synbass',8,54],
 mb_sharp:['Arturia MicroBrute bass (“Sharp Bass”)','mb_sharp','sy','synbass',22,56],
 mg1_moog:['Moog-built Concertmate MG-1 bass (“moog bass”)','mg1_moog','sy','synbass',22,44],
 mg1_wob:['Moog-built Concertmate MG-1 wobble (“saw bass wobble”)','mg1_wob','sy','synbass',10,43],
 s100_bass:['Roland System 100 bass (“a-Bass”)','s100_bass','sy','synbass',34,68],
 s100_lead:['Roland System 100 lead (“Pretty Lead”)','s100_lead','sy','synlead',32,77],
 s100_saw4:['Roland System 100 detuned saws (“Mid Res Saw x4 detune”)','s100_saw4','sy','saw',22,76],
 sh2_ghost:['Roland SH-2 bass (“Ghost Bass”)','sh2_ghost','sy','synbass',15,45],
 sh2_rezsaw:['Roland SH-2 resonant saw (“Rezzy Saw Vel”)','sh2_rezsaw','sy','acid',10,47],
 sh2_rezsq:['Roland SH-2 resonant square (“Rezzy Sqr”)','sh2_rezsq','sy','acid',10,47],
 sh2_simple:['Roland SH-2 lead (“Simple Tone”)','sh2_simple','sy','synlead',32,87],
 sh2_two:['Roland SH-2 bass (“Two Finger Bass”)','sh2_two','sy','synbass',15,45],
 un_lush:['Novation UltraNova pad (“Lush”)','un_lush','sy','synpad',34,92],
 un_mgbass:['Novation UltraNova bass (“MG Bass”)','un_mgbass','sy','synbass',10,44],
 xp_bigstack:['Oberheim Xpander stack (“Big Stack”)','xp_bigstack','sy','saw',22,82],
 xp_phase:['Oberheim Xpander lead (“Phase Lead”)','xp_phase','sy','synlead',32,76],
 xp_sawpl:['Oberheim Xpander saw pluck (“SAW LP-4P HI-RES-SHORT”)','xp_sawpl','sy','synthpluck',34,77],
 xp_snappy:['Oberheim Xpander bass (“Thick Snappy”)','xp_snappy','sy','synbass',-4,45],
 z1_brassbass:['Korg Z1 bass (“Brass Bass”)','z1_brassbass','sy','synbass',10,44],
 z1_plucky:['Korg Z1 pluck (“plucky”)','z1_plucky','sy','synthpluck',24,87],
 z1_string:['Korg Z1 strings (“Large String”)','z1_string','sy','synpad',20,80],
 grand:['Salamander grand piano',['piano_p','piano_f'],'hq','piano',21,108],
 steinway:['Steinway B grand',['steinway_p','steinway_f'],'rx','piano',22,102],
 kawai:['Kawai grand','kawai','rx','piano',22,108],
 felt:['Felt upright piano',['upright_p','upright_f'],'hq','piano',21,108],
 knight:['Knight upright piano','upright_knight','rx','piano',21,108],
 yamaha_up:['Yamaha upright piano','upright_yamaha','rx','piano',24,96],
 wurli:['Wurlitzer EP200',['wurli_p','wurli_f'],'hq','epiano',33,92],
 cp80:['Yamaha CP-80 electric grand',['cp80_p','cp80_f'],'rx','epiano',27,107],
 pianet:['Hohner Pianet T','pianet','rx','epiano',29,88],
 fmpiano:['Yamaha TX81Z FM piano','fm_piano','rx','synth',12,96],
 fmpiano2:['Yamaha TX81Z piano','fm_piano1','rx','synth',24,108],
 fmclav:['Yamaha TX81Z clavisynth','fm_clav','rx','synthpluck',36,108],
 harpsi:['Flemish harpsichord','harpsichord','rx','pluck',30,82],
 pipeorgan:['Pipe organ','pipe_organ','rx','organ',36,93],
 renorgan:['Renaissance organ','ren_organ','rx','organ',36,86],
 nylon:['Nylon-string guitar','guitar_nylon','hq','guitar',35,82],
 steel:['Steel-string guitar','guitar_steel','hq','guitar',38,74],
 eguitar:['Electric guitar','eguitar','rx','guitar',37,84],
 strumstick:['Strumstick','strumstick','rx','pluck',50,81],
 dantranh:['Đàn tranh zither','dan_tranh','rx','pluck',47,83],
 psaltery:['Bowed psaltery','psaltery','rx','solo',70,88],
 harp:['Concert harp','harp','hq','harp',28,101],
 folkharp:['Folk harp','folk_harp','rx','harp',36,92],
 jazzbass:['Jazz Bass','jazz_bass','rx','bassE',25,63],
 swagbass:['Electric bass','swag_bass','rx','bassE',21,69],
 bassvi:['Bass VI','bass_vi','rx','bassE',25,73],
 ergo:['Electric upright bass','ergo_bass','rx','bassU',16,54],
 dbpizz:['Double bass','rubner_pizz','rx','bassU',24,57],
 dbpizz2:['Upright bass','bass_pizz','hq','bassU',28,59],
 dbarco:['Bowed double bass','rubner_arco','rx','bow',24,69],
 contrabass:['Contrabass section','contrabass','hq','bow',30,59],
 strings:['String section','strings','hq','ens',36,86],
 pizz:['Pizzicato strings','pizz','hq','pizz',36,86],
 violin:['Solo violin',['violin_p','violin_f'],'hq','solo',55,96],
 cello:['Cello','cello','hq','solo',36,77],
 flute:['Flute','flute','hq','pipe',60,96],
 recorder:['Alto recorder','recorder','rx','pipe',65,86],
 ocarina:['Ocarina','ocarina','rx','pipe',69,84],
 oboe:['Oboe','oboe','hq','reed',58,89],
 clarinet:['Clarinet','clarinet','hq','reed',50,90],
 bassoon:['Bassoon','bassoon','hq','reed',34,75],
 tenorsax:['Tenor sax','tenor_sax','hq','reed',46,86],
 saxello:['Saxello','saxello','rx','reed',58,82],
 harmonica:['Harmonica','harmonica','hq','reed',60,96],
 harmonica64:['Chromatic harmonica','harmonica64','rx','reed',48,96],
 horn:['French horn','horn','hq','brass',33,77],
 trumpet:['Trumpet','trumpet','rx','brass',53,84],
 mutetpt:['Muted trumpet','trumpet_mute','hq','brass',58,81],
 trombone:['Trombone','trombone','rx','brass',34,65],
 tuba:['Tuba','tuba','rx','brass',29,62],
 vibes:['Vibraphone','vibes','rx','mallet',53,88],
 vibeshard:['Vibraphone, hard mallets','vibes_hard','rx','mallet',53,84],
 marimba:['Marimba','marimba','hq','mallet',41,96],
 xylo:['Xylophone','xylophone','rx','mallet',67,108],
 glock:['Glockenspiel','glock','hq','mallet',79,108],
 tubular:['Tubular bells','tubular','rx','mallet',60,76],
 chimes:['Hand chimes','hand_chimes','rx','mallet',60,94],
 kalimba:['Kalimba','kalimba_k','rx','pluck',59,81],sub808:['Roland TR-808 bass drum, tuned','tr808_sub','rx','b808',19,50],splendid:['Splendid Grand (Akai, public domain)','splendid','rx','piano',21,108],mbira_b:['Mbira dzaVadzimu (Zimbabwe)','mbira_b','rx','pluck',49,84],mbira_g:['Mbira mavembe (Zimbabwe)','mbira_g','rx','pluck',44,80],
rec_sop:["Soprano recorder",'rec_sop','rx','pipe',70,97],rec_sop_st:["Soprano recorder, staccato",'rec_sop_st','rx','stac',70,94],rec_alto:["Alto recorder, straight",'rec_alto','rx','pipe',63,89],rec_alto_st:["Alto recorder, staccato",'rec_alto_st','rx','stac',64,89],rec_ten:["Tenor recorder",'rec_ten','rx','pipe',58,84],rec_ten_st:["Tenor recorder, staccato",'rec_ten_st','rx','stac',58,83],rec_bass:["Bass recorder",'rec_bass','rx','pipe',51,77],ocarina_s:["Small ocarina",'ocarina_s','rx','pipe',80,97],ocarina_st:["Small ocarina, staccato",'ocarina_st','rx','stac',79,98],ocarina_n:["Ocarina, straight",'ocarina_n','rx','pipe',67,87],organ_loud:["Pipe organ, full",'organ_loud','rx','organ',34,96],organ_ped:["Pipe organ pedal",'organ_ped','rx','organ',34,66],renorg4:["Renaissance organ 4'",'renorg4','rx','organ',46,99],renorgfull:["Renaissance organ, full",'renorgfull','rx','organ',34,87],harm20c:["Hohner Special 20 harmonica (C)",'harm20c','rx','reed',58,94],harm20c_soft:["Hohner Special 20, soft",'harm20c_soft','rx','reed',58,94],harm20f_vib:["Hohner Special 20 (F), hand vibrato",'harm20f_vib','rx','reed',63,99],harm20f_acc:["Hohner Special 20 (F), accented",'harm20f_acc','rx','reed',63,99],harm20f_st:["Hohner Special 20 (F), staccato",'harm20f_st','rx','stac',63,104],harm64n:["Hohner Super 64 chromatic",'harm64n','rx','reed',46,94],saxello_nv:["Saxello, straight",'saxello_nv','rx','reed',56,85],saxello_st:["Saxello, staccato",'saxello_st','rx','stac',56,85],tsax_nv:["Tenor sax, straight",'tsax_nv','rx','reed',42,87],tsax_vib:["Tenor sax, vibrato",'tsax_vib','rx','reed',44,85],tsax_st:["Tenor sax, staccato",'tsax_st','rx','stac',42,87],wineglass_f:["Wine glasses, fast",'wineglass_f','rx','pad',73,85],kalimba_t:["Kalimba (Tanzania)",'kalimba_t','rx','pluck',41,95],tubglock:["Tubular glockenspiel",'tubglock','rx','mallet',89,108],vibes_bow:["Bowed vibraphone",'vibes_bow','rx','pad',55,84],xylo_hard:["Xylophone, hard mallets",'xylo_hard','rx','mallet',65,106],xylo_soft:["Xylophone, soft mallets",'xylo_soft','rx','mallet',65,111],dantranh_trem:["Đàn tranh, tremolo",'dantranh_trem','rx','pluck',45,81],dantranh_vib:["Đàn tranh, vibrato",'dantranh_vib','rx','pluck',45,81],kawai_legacy:["Kawai grand (legacy set)",'kawai_legacy','rx','piano',22,106],hpsi_eng:["English harpsichord",'hpsi_eng','rx','pluck',32,85],hpsi_lute:["Harpsichord, lute stop",'hpsi_lute','rx','pluck',32,89],hpsi_fl4:["Flemish harpsichord 4'",'hpsi_fl4','rx','pluck',40,95],hpsi_flfull:["Flemish harpsichord, full",'hpsi_flfull','rx','pluck',28,83],hpsi_fr:["French harpsichord",'hpsi_fr','rx','pluck',24,83],hpsi_it:["Italian harpsichord",'hpsi_it','rx','pluck',28,85],hpsi_unk:["Harpsichord (unattributed)",'hpsi_unk','rx','pluck',27,89],psaltery_pl:["Psaltery, plucked",'psaltery_pl','rx','pluck',68,91],psaltery_sp:["Psaltery, spiccato bow",'psaltery_sp','rx','stac',68,91],concert_harp2:["Concert harp II",'concert_harp2','rx','harp',26,104],growly_angry:["Growlybass, driven",'growly_angry','rx','bassE',23,66],growly_dirty:["Growlybass, dirty",'growly_dirty','rx','bassE',23,66],growly_shifty:["Growlybass, phased",'growly_shifty','rx','bassE',23,66],swag_shiny:["Swagbass, bright",'swag_shiny','rx','bassE',19,72],pasta_fet:["Pastabass, fettuccine",'pasta_fet','rx','bassE',26,76],pasta_lin:["Pastabass, linguine",'pasta_lin','rx','bassE',23,76],pasta_tag:["Pastabass, tagliatelle",'pasta_tag','rx','bassE',23,76],meat_pizz:["Meatbass upright, pizzicato",'meat_pizz','rx','bassU',19,81],meat_arco:["Meatbass upright, arco",'meat_arco','rx','bow',19,72],ergo_arco:["Ergo electric upright, arco",'ergo_arco','rx','bow',14,60],vln_sec_spic:["Violin section, spiccato",'vln_sec_spic','rx','stac',53,89],vln_sec_pizz:["Violin section, pizzicato",'vln_sec_pizz','rx','pizz',53,89],vln_sec_trem:["Violin section, tremolo",'vln_sec_trem','rx','ens',53,89],vla_sec:["Viola section",'vla_sec','rx','ens',46,89],vla_sec_spic:["Viola section, spiccato",'vla_sec_spic','rx','stac',46,89],vla_sec_pizz:["Viola section, pizzicato",'vla_sec_pizz','rx','pizz',46,89],vla_sec_trem:["Viola section, tremolo",'vla_sec_trem','rx','ens',46,89],vc_sec:["Cello section",'vc_sec','rx','ens',34,80],vc_sec_spic:["Cello section, spiccato",'vc_sec_spic','rx','stac',34,80],vc_sec_pizz:["Cello section, pizzicato",'vc_sec_pizz','rx','pizz',34,80],vc_sec_trem:["Cello section, tremolo",'vc_sec_trem','rx','ens',34,80],vln_solo_pizz:["Solo violin, pizzicato",'vln_solo_pizz','rx','pizz',53,99],vln_solo_spic:["Solo violin, spiccato",'vln_solo_spic','rx','stac',53,99],vln_solo_trem:["Solo violin, tremolo",'vln_solo_trem','rx','bow',53,99],cb_solo_pizz:["Solo double bass, pizzicato",'cb_solo_pizz','rx','bassU',26,62],cb_solo_arco:["Solo double bass, arco",'cb_solo_arco','rx','bow',28,62],cb_solo_spic:["Solo double bass, spiccato",'cb_solo_spic','rx','stac',26,62],horn_mute:["French horn, muted",'horn_mute','rx','brass',44,80],horn_stac:["French horn, staccato",'horn_stac','rx','stac',31,80],tpt_harmon:["Trumpet, Harmon mute",'tpt_harmon','rx','brass',56,84],tpt_straight:["Trumpet, straight mute",'tpt_straight','rx','brass',56,84],tpt_stac:["Trumpet, staccato",'tpt_stac','rx','stac',51,87],tpt_vib:["Trumpet, vibrato",'tpt_vib','rx','brass',51,87],tbn_stac:["Trombone, staccato",'tbn_stac','rx','stac',32,68],tbn_vib:["Trombone, vibrato",'tbn_vib','rx','brass',39,66],oldtbn:["Vintage trombone",'oldtbn','rx','brass',39,68],oldtbn_short:["Vintage trombone, short",'oldtbn_short','rx','stac',39,68],oldtbn_vib:["Vintage trombone, vibrato",'oldtbn_vib','rx','brass',44,68],tuba_stac:["Tuba, staccato",'tuba_stac','rx','stac',32,65],fl_stac:["Flute, staccato",'fl_stac','rx','stac',67,99],fl_nv:["Flute, straight",'fl_nv','rx','pipe',58,99],fl_expvib:["Flute, expressive vibrato",'fl_expvib','rx','pipe',58,99],picc:["Piccolo",'picc','rx','pipe',77,106],ob_stac:["Oboe, staccato",'ob_stac','rx','stac',56,92],ob_vib:["Oboe, vibrato",'ob_vib','rx','reed',56,92],cl_stac:["Clarinet, staccato",'cl_stac','rx','stac',48,92],bsn_stac:["Bassoon, staccato",'bsn_stac','rx','stac',32,75],bsn_vib:["Bassoon, vibrato",'bsn_vib','rx','reed',41,75],upright_nr1:["Upright piano No. 1",'upright_nr1','rx','piano',22,106],marimba_vsco:["Marimba II",'marimba_vsco','rx','mallet',39,99],bigcat_cello:["Cello (Bigcat), bowed",'bigcat_cello','rx','bow',34,106],bigcat_cello_pl:["Cello (Bigcat), plucked",'bigcat_cello_pl','rx','pizz',34,96],weresax:["Weresax alto sax",'weresax','rx','reed',47,82],weresax_p:["Weresax alto sax, soft",'weresax_p','rx','reed',47,82],bearsax:["Bear Sax baritone",'bearsax','rx','reed',34,69],wartuba:["War Tuba",'wartuba','rx','brass',27,64],shiny_ac:["Shinyguitar acoustic",'shiny_ac','rx','guitar',35,87],shiny_el:["Shinyguitar electric",'shiny_el','rx','guitar',35,87],emily:["Emilyguitar electric",'emily','rx','guitar',35,99],green_twang:["Green electric guitar",'green_twang','rx','guitar',38,88],green_stac:["Green electric guitar, muted",'green_stac','rx','stac',38,88],black_twang:["Black electric guitar",'black_twang','rx','guitar',38,88],black_stac:["Black electric guitar, muted",'black_stac','rx','stac',38,88],biglittle:["Big Little Bass",'biglittle','rx','bassE',21,68],biglittle_soft:["Big Little Bass, soft",'biglittle_soft','rx','bassE',21,68],darkblack:["Dark Black bass",'darkblack','rx','bassE',21,65],darkblack_warm:["Dark Black bass, warm",'darkblack_warm','rx','bassE',21,65],darkblack_stac:["Dark Black bass, staccato",'darkblack_stac','rx','stac',24,65],babyblue:["Baby Blue bass",'babyblue','rx','bassE',20,64],sneaky:["Sneakybass upright",'sneaky','rx','bassU',22,63],sneaky_mute:["Sneakybass upright, muted",'sneaky_mute','rx','stac',22,63],fashion:["Fashionbass",'fashion','rx','bassE',19,99],erhu:["Erhu",'erhu','rx','bow',60,83],erhu_short:["Erhu, short",'erhu_short','rx','stac',60,83],cithara_f:["Cithara (lyre), finger",'cithara_f','rx','harp',62,84],cithara_n:["Cithara (lyre), nail",'cithara_n','rx','harp',62,84],cithara_m:["Cithara (lyre), muted",'cithara_m','rx','stac',62,84],ganjo:["Guitar banjo",'ganjo','rx','guitar',37,73],hzither:["Hungarian zither",'hzither','rx','pluck',53,85],horsepulse:["Bass tagelharpa, plucked",'horsepulse','rx','bassU',36,78],steeldrum:["Steel drum",'steeldrum','rx','mallet',58,84],osiris:["Osiris piano",'osiris','rx','piano',19,110],mtg_sop:["Soprano sax (MTG)",'mtg_sop','rx','reed',54,89],mtg_alto:["Alto sax (MTG)",'mtg_alto','rx','reed',47,82],mtg_tenor:["Tenor sax (MTG)",'mtg_tenor','rx','reed',42,77],mtg_bari:["Baritone sax (MTG)",'mtg_bari','rx','reed',34,72],
 wineglass:['Wine glasses','wine_glass','rx','pad',75,86]};
const FEEL={stac:{lag:3,jit:4,att:.002,rel:.12,br:.8},b808:{lag:1,jit:2,att:.002,rel:.1,br:.6},piano:{lag:4,jit:6,att:.002,rel:.5,roll:12,br:1},epiano:{lag:5,jit:6,att:.003,rel:.35,roll:9,br:.9},synth:{lag:2,jit:3,att:.002,rel:.45,roll:6,br:1},synthpluck:{lag:1,jit:3,att:.001,rel:.25,roll:4,br:1},
 organ:{lag:2,jit:4,att:.012,rel:.15,br:.8},guitar:{lag:6,jit:7,att:.002,rel:.3,roll:20,br:1},pluck:{lag:3,jit:6,att:.001,rel:.6,br:1.1},harp:{lag:3,jit:6,att:.001,rel:1.1,roll:28,br:1.1},
 bassE:{lag:8,jit:5,att:.004,rel:.08,br:.6},bassU:{lag:10,jit:6,att:.003,rel:.15,br:.5},bow:{lag:12,jit:8,att:.12,rel:.4,br:.85},ens:{lag:14,jit:9,att:.25,rel:.6,br:.85},pizz:{lag:4,jit:6,att:.002,rel:.25,br:1},
 solo:{lag:12,jit:9,att:.08,rel:.28,br:.9},pipe:{lag:8,jit:8,att:.045,rel:.22,br:1},reed:{lag:8,jit:8,att:.035,rel:.2,br:.95},brass:{lag:8,jit:8,att:.035,rel:.22,br:.9},
 mallet:{lag:0,jit:4,att:.001,rel:.7,br:1.1},synpad:{lag:0,jit:2,att:.07,rel:.9,br:.9},saw:{lag:0,jit:2,att:.006,rel:.3,br:1},synlead:{lag:2,jit:3,att:.005,rel:.22,br:1},synbrass:{lag:3,jit:4,att:.025,rel:.28,br:.95},synbass:{lag:0,jit:2,att:.002,rel:.06,br:.7},acid:{lag:0,jit:1,att:.001,rel:.04,br:.8},pad:{lag:0,jit:3,att:.6,rel:1.4,br:.8},perc:{lag:0,jit:4,att:.001,rel:.4,br:1}};
const SUST=new Set(['organ','bow','ens','solo','pipe','reed','brass','pad','synpad','saw','synlead','synbrass']),SCOOPK=new Set(['reed','brass','pipe','solo']),SLIDEK=new Set(['bassU','b808','synbass','acid']);

/* ---------- sample library ---------- */
let DC=null;const LOCAL={hq:'sf/hq/',rx:'sf/rx/',kit:'sf/kit/',sy:'sf/sy/'};
async function grab(dir,name){const r=await fetch(LOCAL[dir]+name+'.json');if(!r.ok)throw Error('Could not load '+name);return r.json()}
const PBCSTAT={ctxMade:0,ctxStarted:0,ctxDone:0,yields:0,watchSet:0,watchCleared:0,visAdd:0,visRemove:0};
const YQ=[];let YCH=null;
const yieldTask=()=>new Promise(r=>{
  try{
    if(!YCH){YCH=new MessageChannel();
      YCH.port1.onmessage=()=>{const n=YQ.length;for(let i=0;i<n;i++){const fn=YQ.shift();try{fn()}catch(e){}}};
      YCH.port1.start&&YCH.port1.start()}
    YQ.push(r);if(YQ.length===1)YCH.port2.postMessage(0);
  }catch(e){setTimeout(r,0)}
});
const banks=new Map();
function bank(dir,name){const k=dir+'/'+name;let p=banks.get(k);if(!p){p=grab(dir,name).then(j=>({keys:Object.keys(j.samples).map(Number).sort((a,b)=>a-b),b64:j.samples,tune:j.tune||{}}));banks.set(k,p);p.catch(()=>banks.delete(k))}return p}
const kits=new Map();function kitFile(n){let p=kits.get(n);if(!p){p=grab('kit',n);kits.set(n,p);p.catch(()=>kits.delete(n))}return p}
const cache=new Map(),order=[],CAP=260;
function remember(id,p){cache.set(id,p);order.push(id);p.catch(()=>cache.delete(id));while(order.length>CAP)cache.delete(order.shift());return p}
const bytes=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
function tidy(a){const n=a.length,ch=a.numberOfChannels,o=new AudioBuffer({length:n,sampleRate:a.sampleRate,numberOfChannels:2});let pk=0;for(let c=0;c<2;c++){const s=a.getChannelData(Math.min(c,ch-1)),d=o.getChannelData(c);for(let i=0;i<n;i++){d[i]=s[i];const v=s[i]<0?-s[i]:s[i];if(v>pk)pk=v}}const g=pk?.7/pk:1;for(let c=0;c<2;c++){const d=o.getChannelData(c);for(let i=0;i<n;i++)d[i]*=g}return o}
function sample(dir,set,key,b){const id=dir+'/'+set+'/'+key;return cache.get(id)||remember(id,DC.decodeAudioData(bytes(b.b64[key])).then(tidy))}
function hitSample(kit,hit,i,b64){const id='kit/'+kit+'/'+hit+'/'+i;return cache.get(id)||remember(id,DC.decodeAudioData(bytes(b64)).then(tidy))}
function nearest(keys,m){let best=keys[0],bd=1e9;for(const k of keys){const d=Math.abs(k-m)+(k<m?.1:0);if(d<bd){bd=d;best=k}}return best}

/* ---------- theory ---------- */
const Q={maj:[0,4,7],m:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],'9':[0,4,7,10,14],maj9:[0,4,7,11,14],m9:[0,3,7,10,14],add9:[0,4,7,14],madd9:[0,3,7,14],sus2:[0,2,7],sus4:[0,5,7],'7sus4':[0,5,7,10],'6':[0,4,7,9],m6:[0,3,7,9],'69':[0,4,7,9,14],m11:[0,3,7,10,14,17],'13':[0,4,10,14,21],dim:[0,3,6],dim7:[0,3,6,9],hdim:[0,3,6,10]};
const QN={maj:'',m:'m','7':'7',maj7:'maj7',m7:'m7','9':'9',maj9:'maj9',m9:'m9',add9:'add9',madd9:'m(add9)',sus2:'sus2',sus4:'sus4','7sus4':'7sus4','6':'6',m6:'m6','69':'6/9',m11:'m11','13':'13',dim:'°',dim7:'°7',hdim:'ø7'};
const NOTE=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'],SC={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],mix:[0,2,4,5,7,9,10],lyd:[0,2,4,6,7,9,11]},MODEN={maj:'major',min:'minor',dor:'Dorian',mix:'Mixolydian',lyd:'Lydian'};
const MAJ2MIN=[0,1,2,3,3,5,6,7,8,8,10,10],QORD=['maj','m','7','m7','maj7','dim','dim7','hdim','sus4'];
function identify(pcs,bassPc){let best=null;for(let r=0;r<12;r++)for(const q of QORD){const s=Q[q].map(x=>(r+x)%12),cov=pcs.filter(p=>s.includes(p)).length/pcs.length,miss=s.filter(p=>!pcs.includes(p)).length,sc=cov-.2*miss-.006*QORD.indexOf(q)+(bassPc==r?.08:0);if(!best||sc>best[0])best=[sc,r,q]}return best}
function chord(sym,key){const[a,b]=sym.split('/'),i=a.indexOf(':'),r=+a.slice(0,i),q=a.slice(i+1),iv=Q[q],root=(key+r)%12,bass=(key+(b!=null?+b:r))%12;return{rel:r,root,bass,iv,q,pcs:[...new Set(iv.map(x=>(root+x)%12))],name:NOTE[root]+QN[q]+(b!=null?'/'+NOTE[bass]:'')}}
function voice(c,lo,hi,n,prev,o={}){const cand=[];for(let m=lo;m<=hi;m++)if(c.pcs.includes(m%12))cand.push(m);n=Math.min(n,cand.length);const th=c.iv.find(x=>x>=2&&x<=5),sv=c.iv.find(x=>x>=9&&x<=11),pt=th!=null?(c.root+th)%12:-1,ps=sv!=null?(c.root+sv)%12:-1;let best=null,bs=1e9;const pk=[];
 const score=v=>{let s=0;const pc=v.map(m=>m%12),set=new Set(pc);if(pt>=0&&!set.has(pt))s+=30;if(ps>=0&&!set.has(ps))s+=12;s+=(v.length-set.size)*4;if(o.rootless&&set.has(c.root))s+=7;if(!o.rootless&&!o.bassCovers&&!set.has(c.root))s+=6;for(const p of c.pcs)if(!set.has(p))s+=1.5;if(o.lowBass&&pc[0]!==c.bass)s+=15;
  for(let i=1;i<v.length;i++){const d=v[i]-v[i-1];if(d<3&&v[i-1]<55)s+=9;if(d<=2)s+=2.5;if(d>9&&i<v.length-1)s+=3;if(d>12)s+=6}if(v[v.length-1]-v[0]>(o.span||17))s+=20;
  if(prev&&prev.length){let mv=0;for(let i=0;i<v.length;i++)mv+=Math.abs(v[i]-prev[Math.round(i*(prev.length-1)/Math.max(1,v.length-1))]);s+=mv*.9+Math.abs(v[v.length-1]-prev[prev.length-1])*.8}else s+=Math.abs((v[0]+v[v.length-1])/2-(o.center||(lo+hi)/2))*.5;return s};
 const rec=st=>{if(pk.length===n){const s=score(pk);if(s<bs){bs=s;best=pk.slice()}return}for(let i=st;i<=cand.length-(n-pk.length);i++){pk.push(cand[i]);rec(i+1);pk.pop()}};if(cand.length<=22)rec(0);else{const mid=cand.filter(m=>m>=lo+3&&m<=hi-3);cand.length=0;cand.push(...mid.slice(0,20));rec(0)}return best||cand.slice(0,n)}
const near=(pc,ref,lo,hi)=>{let b=null,bd=1e9;for(let m=lo;m<=hi;m++)if(mod(m,12)===mod(pc,12)&&Math.abs(m-ref)<bd){bd=Math.abs(m-ref);b=m}return b??clamp(ref,lo,hi)};
const PROGS={
 flamenco:{maj:['0:m 10:maj 8:maj 7:maj','0:m 10:maj 8:maj 7:maj 7:maj 8:maj 10:maj 0:m','5:m 0:m 10:maj 8:maj 7:maj'],min:['0:m 10:maj 8:maj 7:maj','0:m 10:maj 8:maj 7:maj 7:maj 8:maj 10:maj 0:m','5:m 0:m 10:maj 8:maj 7:maj']},
 pop:{maj:['0:maj 7:maj 9:m 5:maj','9:m 5:maj 0:maj 7:maj','0:maj 9:m 5:maj 7:maj','0:maj 7:maj/11 9:m 5:maj','5:maj 0:maj/4 2:m 7:maj','0:maj 4:m 5:maj 7:maj'],min:['0:m 8:maj 3:maj 10:maj','0:m 5:m 8:maj 10:maj','8:maj 10:maj 0:m 0:m','0:m 8:maj 5:m 7:maj']},
 folk:{maj:['0:maj 5:maj 0:maj 7:maj','0:maj 7:maj 5:maj 0:maj','9:m 5:maj 0:maj 7:maj','0:maj 5:maj 9:m 7:maj','0:maj 0:maj 5:maj 7:maj'],min:['0:m 10:maj 8:maj 7:maj','0:m 10:maj 0:m 7:maj','0:m 8:maj 10:maj 0:m']},
 cine:{maj:['0:maj 4:m 9:m 5:maj','9:m 5:maj 0:maj 7:maj','0:maj 7:maj/11 9:m 4:m 5:maj 0:maj/4 2:m 7:sus4','5:maj 0:maj/4 9:m 7:maj'],min:['0:m 8:maj 3:maj 10:maj','0:m 5:m 8:maj 7:maj','0:m 8:maj 5:m 10:maj','8:maj 3:maj 10:maj 0:m']},
 soul:{maj:['0:maj 9:m 2:m 7:maj','5:maj 4:m 2:m 7:sus4','0:maj 5:maj 0:maj 5:m','5:maj 7:maj 4:m 9:m','2:m 7:maj 0:maj 0:maj'],min:['0:m 5:m 0:m 5:m','0:m 8:maj 2:dim 7:maj','0:m 10:maj 8:maj 7:maj']},
 jazz:{maj:['2:m 7:7 0:maj 9:m','0:maj 9:m 2:m 7:7','4:m 9:m 2:m 7:7','0:maj 0:maj 2:m 7:7'],min:['2:dim 7:7 0:m 0:m','0:m 5:m 2:dim 7:7']},
 lofi:{maj:['5:maj 4:m 2:m 0:maj','0:maj 9:m 5:maj 7:maj','2:m 7:maj 0:maj 0:maj','5:maj 0:maj 9:m 4:m'],min:['0:m 5:m 10:maj 3:maj','0:m 8:maj 5:m 7:maj','0:m 3:maj 5:m 5:m']},
 ambient:{maj:['0:maj 5:maj','0:maj 2:maj 0:maj 5:maj','9:m 5:maj 0:maj 0:maj','0:maj 9:m 5:maj 5:maj'],min:['0:m 8:maj 0:m 3:maj','0:m 8:maj 3:maj 10:maj']},
 bossa:{maj:['0:maj 0:maj 2:m 7:7','0:maj 9:m 2:m 7:7','2:m 7:7 0:maj 0:maj','0:maj 5:maj 2:m 7:7'],min:['0:m 5:m 2:dim 7:7','0:m 0:m 5:m 7:7']},
 gospel:{maj:['0:maj 5:maj 0:maj 7:maj','0:maj 4:m 5:maj 5:m','5:maj 0:maj/4 2:m 7:maj','0:maj 0:7 5:maj 5:m'],min:['0:m 5:m 7:maj 0:m','0:m 8:maj 7:maj 7:maj']},
 funk:{maj:['0:maj 5:maj 0:maj 5:maj','0:maj 0:maj 5:maj 7:maj','0:maj 10:maj 5:maj 0:maj','0:maj 5:maj 2:m 7:maj'],min:['0:m 5:maj 0:m 5:maj','0:m 0:m 5:m 7:maj','0:m 10:maj 8:maj 10:maj']},
 anthem:{maj:['0:maj 7:maj 9:m 5:maj','0:maj 2:m 9:m 5:maj','5:maj 0:maj 7:maj 9:m','0:maj 9:m 5:maj 7:maj','9:m 5:maj 0:maj 7:maj','0:maj 7:maj/11 9:m 5:maj'],min:['0:m 8:maj 3:maj 10:maj','0:m 10:maj 8:maj 10:maj','8:maj 10:maj 0:m 0:m']},
 epic:{maj:['0:maj 7:maj 9:m 5:maj','9:m 5:maj 0:maj 7:maj'],min:['0:m 0:m 8:maj 10:maj','0:m 8:maj 3:maj 10:maj','0:m 10:maj 8:maj 7:maj','0:m 3:maj 10:maj 8:maj','0:m 0:m 8:maj 8:maj']},
 modal:{maj:['0:maj 10:maj 5:maj 0:maj','0:maj 10:maj 0:maj 10:maj'],min:['0:m 5:maj 0:m 5:maj','0:m 10:maj 5:maj 0:m','0:m 3:maj 10:maj 5:maj']}};
// genre harmony colour: each chord family (Major, minor, Dominant, diminished, suspended) gets the extensions the genre uses
const FAM=(q,rel)=>['7','9','13','7sus4'].includes(q)||(q=='maj'&&rel==7)?'D':['dim','dim7','hdim'].includes(q)?'d':['sus2','sus4'].includes(q)?'s':['m','m7','m9','m11','m6','madd9'].includes(q)?'m':'M';
const COLORS={triad:{M:['maj'],m:['m'],D:['maj'],d:['dim'],s:['sus4']},pop:{M:['add9','maj','add9'],m:['m7','m'],D:['maj','sus4'],d:['dim'],s:['sus4']},
 cine:{M:['add9','maj','sus2'],m:['m','madd9'],D:['maj','sus4'],d:['dim'],s:['sus4','sus2']},soul:{M:['maj9','maj7'],m:['m9','m7'],D:['9','7sus4'],d:['hdim'],s:['7sus4']},
 jazz:{M:['maj9','69'],m:['m9','m7'],D:['13','9'],d:['hdim'],s:['7sus4']},lofi:{M:['maj7','maj9'],m:['m9','m7'],D:['7sus4','9'],d:['hdim'],s:['sus2']},
 bossa:{M:['maj7','69'],m:['m7','m9'],D:['9','7'],d:['hdim'],s:['7sus4']},gospel:{M:['maj','add9','6'],m:['m7'],D:['7','9'],d:['dim7'],s:['sus4']},
 seventh:{M:['maj7'],m:['m7'],D:['7'],d:['hdim'],s:['7sus4']},funk:{M:['9','7','maj'],m:['m7','m9','m7'],D:['9','7'],d:['hdim'],s:['7sus4']},bright:{M:['maj','add9','maj','sus2'],m:['m','m7'],D:['maj','sus4'],d:['dim'],s:['sus4','sus2']}};


// instrument families: a genre's hand-picked lineup also opens up every sibling in the same family
const CATS={piano:'grand steinway kawai felt knight yamaha_up upright_nr1 kawai_legacy osiris splendid',epiano:'wurli cp80 pianet fmpiano fmpiano2',clav:'fmclav',
 harpsi:'harpsi hpsi_eng hpsi_lute hpsi_fl4 hpsi_flfull hpsi_fr hpsi_it hpsi_unk',organ:'pipeorgan renorgan organ_loud renorg4 renorgfull',
 acgtr:'nylon steel shiny_ac ganjo strumstick',elgtr:'eguitar shiny_el emily green_twang black_twang',mutegtr:'green_stac black_stac',
 ebass:'jazzbass swagbass bassvi growly_angry growly_dirty growly_shifty swag_shiny pasta_fet pasta_lin pasta_tag biglittle biglittle_soft darkblack darkblack_warm babyblue fashion',
 ubass:'ergo dbpizz dbpizz2 meat_pizz sneaky cb_solo_pizz horsepulse',shortbass:'darkblack_stac sneaky_mute',bowbass:'dbarco contrabass meat_arco ergo_arco cb_solo_arco',
 strings:'strings vla_sec vc_sec vln_sec_trem vla_sec_trem vc_sec_trem',pizz:'pizz vln_sec_pizz vla_sec_pizz vc_sec_pizz vln_solo_pizz bigcat_cello_pl',
 spic:'vln_sec_spic vla_sec_spic vc_sec_spic vln_solo_spic cb_solo_spic erhu_short',solostr:'violin cello bigcat_cello vln_solo_trem erhu',
 flute:'flute fl_nv fl_expvib picc recorder rec_sop rec_alto rec_ten rec_bass ocarina ocarina_s ocarina_n',reed:'oboe ob_vib clarinet bassoon bsn_vib',
 sax:'tenorsax saxello saxello_nv tsax_nv tsax_vib weresax weresax_p bearsax mtg_sop mtg_alto mtg_tenor mtg_bari',harmonica:'harmonica harmonica64 harm20c harm20c_soft harm20f_vib harm20f_acc harm64n',
 brass:'horn trumpet mutetpt trombone tuba horn_mute tpt_harmon tpt_straight tpt_vib tbn_vib oldtbn oldtbn_vib wartuba',brassshort:'horn_stac tpt_stac tbn_stac oldtbn_short tuba_stac',
 windshort:'fl_stac ob_stac cl_stac bsn_stac rec_sop_st rec_alto_st rec_ten_st ocarina_st harm20f_st saxello_st tsax_st',
 mallet:'vibes vibeshard marimba marimba_vsco xylo xylo_hard xylo_soft steeldrum',bell:'glock tubglock tubular chimes',
 pluck:'kalimba kalimba_t mbira_b mbira_g harp folkharp concert_harp2 dantranh dantranh_vib psaltery psaltery_pl cithara_f cithara_n hzither',plushort:'cithara_m psaltery_sp',
 pad:'wineglass wineglass_f vibes_bow dantranh_trem',sub:'sub808',synbass:'a4_blip cp_pwbass esq_bass hs_plastic j6_pulse j6_short jx_rounder jx_snap k3_solid mb_sharp mg1_moog s100_bass sh2_ghost sh2_two un_mgbass xp_snappy z1_brassbass',synbell:'a4_fm esq_bell',synpad:'a4_gritpad cp_hollow cp_pwmstack esq_detune hs_vs j6_new j6_open jd_pad jp4_pwm jp4_unison jp4_vikings jx8_dark jx_strings k3_gentle un_lush z1_string',supersaw:'a4_stacker aj_chsaw aj_saw aj_sq cp_bigbad jx_big s100_saw4 xp_bigstack',synpluck:'cp_sawfilt j6_pwpl j6_rich jd_pluck jx_rave xp_sawpl z1_plucky',synlead:'cp_wow jd_bright jd_orange jp4_bold jp4_lead s100_lead sh2_simple xp_phase',synkeys:'esq_ep jd_digi jp4_piano jx_piano k3_ep',synbrass:'jp4_brass',wobble:'k3_wobble mg1_wob',acid:'sh2_rezsaw sh2_rezsq'};
const CATOF={},CATL={};for(const c in CATS){CATL[c]=CATS[c].split(' ').filter(x=>INS[x]);for(const x of CATL[c])CATOF[x]=c}
const SHORTOF={supersaw:'synpluck',synpad:'synpluck',strings:'spic',solostr:'spic',brass:'brassshort',flute:'windshort',reed:'windshort',sax:'windshort',harmonica:'windshort',elgtr:'mutegtr',ubass:'shortbass',ebass:'shortbass',pluck:'plushort'};
const SHORTPAT=new Set(['spiccato','arp16','arp332','chop16','chop16b','hornStab','pluckPulse','ostinato','funk']);
const NEVER=new Set([]),FMKEYS=new Set(['fmpiano','fmpiano2','fmclav']);
const ALT={lead:['violin','cello','bigcat_cello','erhu','vln_solo_trem','eguitar','shiny_el','emily','vibes','harp','grand','wurli'],riff:['vibes','marimba','glock','nylon','eguitar','harp'],counter:['cello','bigcat_cello','vc_sec','vla_sec','vibes','harp'],keys:['grand','kawai','wurli','nylon','steel'],pulse:['nylon','eguitar','harp','marimba'],pad:['strings','vla_sec','vc_sec'],color:['glock','vibes','chimes','tubglock']};
const FLUTES=new Set('flute fl_nv fl_expvib fl_stac picc recorder rec_sop rec_sop_st rec_alto rec_alto_st rec_ten rec_ten_st rec_bass ocarina ocarina_s ocarina_n ocarina_st'.split(' '));
const WINDK=new Set(['pipe','reed','brass','organ']),isWind=x=>!INS[x];
let GPOOL=null,AVOID={},GN='',WHY={},KEEP={},FAV=null;
const ELEC=/Synth|EDM|House|Techno|Trance|Future|Drum & Bass|Chill|Upbeat Pop|Build|Drive|Indie Keys/;
const MISFIT=[[ELEC,/^(lead|counter|color|keys|pulse|riff|dbl)$/,/erhu|violin|vln|cello|vc_|bigcat|contrabass|tubular|knight|dantranh|cithara|psaltery|zither|banjo|^steel$|koto|sitar/],
[/Cinematic|Epic|Chamber/,/^(lead|counter|color|pulse|riff)$/,/steeldrum|twang|swag|kalimba|fmclav|a4_|jd_|cp_|vibeshard|eguitar|pianet|wurli/],
[/Ambient/,/./,/^harp$|folkharp|wurli|xylo|marimba|steel|twang|eguitar|fmclav/],
[/Drum & Bass/,/^(lead|counter|color|riff|pulse)$/,/eguitar|marimba|xylo|steel|twang|banjo|harp/],
[/Americana|Folk|Campfire/,/./,/a4_|jd_|cp_|hs_|sh2_|j6_|jp4_|z1_|esq_|k3_|vibeshard|osiris|knight/],
[/Jazz|Soul|Bossa|Lo-fi|Funk/,/^(lead|counter|color)$/,/erhu|vln_|vc_|tubular|knight|osiris|vibeshard/]];
const GOOD=[[/Upbeat Pop|Uplifting Build|Indie Pop|Indie Keys|Epic Drive|Campfire/,{lead:['jp4_lead','sh2_simple','eguitar','shiny_el','grand','kawai','vibes','k3_ep','jd_orange','steinway'],color:['glock','vibes','kalimba','esq_bell','xylo_soft','j6_rich','a4_blip'],pulse:['nylon','eguitar','j6_rich','z1_plucky','steinway','k3_ep','kalimba','kawai'],pad:['z1_string','jp4_pwm','strings','j6_new','k3_gentle','jx_strings'],keys:['steinway','kawai','grand','k3_ep','jx_piano','wurli','felt'],bass:['bassvi','j6_pulse','esq_bass','jx_rounder']}],
[/Cinematic|Epic|Chamber/,{lead:['cello','violin','vla_sec','grand','steinway','harp','felt'],color:['chimes','glock','harp','felt','vibes'],pulse:['strings','harp','grand','pizz','felt'],pad:['strings','vla_sec','vc_sec','z1_string'],keys:['grand','steinway','felt','harp']}],
[/Ambient|Chillout/,{lead:['felt','kalimba','vibes','esq_bell','dantranh','psaltery','jp4_lead'],color:['kalimba','chimes','esq_bell','vibes','a4_blip'],pulse:['kalimba','felt','esq_bell','j6_rich'],pad:['z1_string','jp4_pwm','un_lush','k3_gentle','strings','hs_vs'],keys:['felt','steinway','k3_ep','esq_ep']}],
[/Americana|Folk/,{lead:['nylon','violin','dantranh','harp','folkharp','grand','eguitar','kalimba'],color:['glock','kalimba','harp','folkharp'],pulse:['nylon','steel','harp','folkharp','strumstick','eguitar'],keys:['steinway','grand','yamaha_up','kawai','felt'],bass:['bassvi','dbpizz','jazzbass']}],
[/Jazz|Soul|Bossa|Lo-fi|Funk/,{lead:['vibes','eguitar','wurli','pianet','steinway','k3_ep','nylon'],color:['vibes','glock','wurli','kalimba'],pulse:['eguitar','nylon','wurli','pianet','k3_ep'],keys:['steinway','wurli','pianet','k3_ep','grand','kawai']}],
[/./,{lead:['jp4_lead','sh2_simple','jd_orange','jd_bright','jp4_bold','s100_lead','xp_phase'],color:['esq_bell','a4_blip','j6_rich','a4_fm'],pulse:['j6_rich','z1_plucky','xp_sawpl','j6_pwpl','jx_rave'],pad:['z1_string','jp4_pwm','jp4_unison','un_lush','j6_new','jx_strings'],keys:['k3_ep','jx_piano','esq_ep','jd_digi'],bass:['j6_pulse','mb_sharp','esq_bass','a4_blip','jx_rounder']}]];
const RMAP={riff:'color',counter:'lead',dbl:'color',pad2:'pad'};
const goodFor=rn=>{const g=GOOD.find(([r])=>r.test(GN));const d=g[1];return (d[rn]||d[RMAP[rn]]||[]).filter(x=>INS[x])};
function fitPick(pool,rn,H,used){let c=[...new Set([...pool,...goodFor(rn)])].filter(x=>INS[x]&&!used.has(x)&&!misfit(x,rn)&&!isWind(x));if(!c.length)return null;const w=c.map(x=>Math.pow(.35,AVOID[x]||0));let t=w.reduce((a,b)=>a+b,0)*H.rg(0,1);for(let i=0;i<c.length;i++){t-=w[i];if(t<=0)return c[i]}return c[c.length-1]}
MISFIT.push([/Cinematic|Epic|Chamber/,/^(lead|color|counter)$/,/erhu|tubular|_trem/],[/Ambient|Americana|Folk|Chillout/,/^dbl$/,/violin|cello|vln|vc_/],[/EDM|House|Techno|Trance|Future|Drum & Bass|Synthwave|Synth-Pop/,/^bass$/,/swagbass|jazzbass|dbpizz|contrabass|upright/]);

// ---- orchestration: which instrument families real records in each genre use ----
const FAMOF=x=>{const I=INS[x];if(!I)return'?';const k=I[3];if(/sax|saxello|mtg_|weresax|bearsax/.test(x))return'sax';if(/^harm|harmonica/.test(x))return'harmonica';if(/flute|^fl_|picc|recorder|^rec_|ocarina/.test(x))return'flute';if(/oboe|^ob_|clarinet|^cl_|bassoon|^bsn/.test(x))return'woodwind';if(/horn|trumpet|tpt|trombone|tbn|tuba|wartuba/.test(x))return'brass';
 if(/^hpsi|harpsi/.test(x))return'harpsi';if(x=='sub808')return'sub';if(/steeldrum/.test(x))return'steeldrum';if(/kalimba|mbira/.test(x))return'kalimba';
 if(/ganjo|strumstick|hzither|psaltery/.test(x))return'folkpluck';if(/erhu|cithara|horsepulse|dantranh/.test(x))return'world';if(/wineglass/.test(x))return'glass';
 if(/^vibes/.test(x))return'vibes';if(k=='mallet'&&/a4_|esq_/.test(x))return'synth';if(k=='mallet')return'mallet';
 if(k=='piano')return'piano';if(k=='epiano')return'epiano';if(k=='organ')return'organ';
 if(k=='guitar'||/_stac$/.test(x)&&/green|black/.test(x))return/nylon|steel|shiny_ac/.test(x)?'acguitar':'eguitar';
 if(k=='harp')return'harp';if(k=='bassE'||/darkblack|growly|pasta|biglittle|babyblue|fashion|swag/.test(x))return'ebass';
 if(k=='bassU'||/sneaky|cb_solo_pizz|meat_pizz/.test(x))return'upright';if(/dbarco|contrabass|meat_arco|ergo_arco|cb_solo_arco|cb_solo_spic/.test(x))return'bowbass';
 if(/violin|vln_solo|^cello|bigcat/.test(x))return'strsolo';if(k=='ens'||k=='pizz'||/vln_sec|vla_sec|vc_sec|^strings|^pizz/.test(x))return'strings';
 if(k=='synbass')return'synbass';if(k=='synpad')return'synpad';if(k=='synth')return'synkeys';if(/^syn|saw|acid/.test(k)||k=='synthpluck')return'synth';return k};
const SYN=['synth','synpad','synbass','synkeys','sub'],ACOUSTIC_POP=['piano','eguitar','acguitar','ebass'];
const GFAM={
 jazz:['piano','epiano','eguitar','acguitar','vibes','upright','ebass','sax','brass','flute','woodwind'],
 soul:['piano','epiano','organ','eguitar','ebass','upright','vibes','strings','sax','brass'],
 lofi:['piano','epiano','eguitar','acguitar','vibes','kalimba','ebass','upright','mallet','harp','sax','flute'],
 bossa:['acguitar','piano','epiano','upright','ebass','vibes','strings','flute','sax'],
 funk:['epiano','piano','organ','eguitar','ebass','vibes','synbass','sax','brass'],
 indie:[...ACOUSTIC_POP,'epiano','mallet','kalimba','strings','upright','vibes','harp','organ','brass','flute'],
 drivepop:[...ACOUSTIC_POP,'epiano','organ','mallet','strings','kalimba','synbass','synpad','brass','sax'],
 anthem:[...ACOUSTIC_POP,'strings','mallet','harp','organ','synpad','synbass','sub','brass'],
 epic:['piano','strings','bowbass','eguitar','ebass','synpad','mallet','harp','sub','strsolo','organ','brass'],
 brooklyn:[...ACOUSTIC_POP,'epiano','mallet','strings','vibes','upright','organ','flute','sax'],
 campfire:['acguitar','piano','ebass','upright','mallet','kalimba','harp','eguitar','folkpluck','harmonica'],
 folk:['acguitar','harp','upright','piano','strsolo','mallet','folkpluck','bowbass','flute','harmonica'],
 americana:['acguitar','eguitar','upright','ebass','piano','strsolo','organ','folkpluck','harmonica'],
 cinematic:['piano','strings','strsolo','bowbass','harp','mallet','glass','sub','organ','vibes','brass','woodwind','flute'],classicalguitar:['acguitar','upright','strsolo','harp','flute'],steelpan:['steeldrum','acguitar','ebass','upright','mallet','piano','sax','brass'],mbira:['kalimba','mallet','upright','acguitar'],marimbag:['mallet','vibes','upright','ebass','kalimba'],eastasian:['world','folkpluck','harp','strings','glass','upright','bowbass','kalimba','flute'],nordic:['world','harp','strings','bowbass','strsolo','folkpluck','upright','flute'],celtic:['harp','strsolo','upright','acguitar','folkpluck','flute'],baroque:['harpsi','strings','strsolo','bowbass','organ','flute','woodwind','brass'],church:['organ','strings','strsolo','bowbass','brass'],bluegrass:['acguitar','strsolo','upright','folkpluck','harmonica'],reggae:['eguitar','epiano','ebass','vibes','piano','brass','sax'],meditation:['glass','vibes','mallet','piano','harp','kalimba','bowbass','flute'],spanish:['acguitar','upright','strsolo'],cellosolo:['strsolo','piano','harp','strings','bowbass','upright','woodwind'],
 chamber:['piano','strings','strsolo','bowbass','harp','harpsi','mallet','upright','woodwind','flute','brass'],
 ambient:['piano','synpad','glass','vibes','harp','kalimba','world','folkpluck','strings','synkeys','synth'],
 world:['world','folkpluck','harp','acguitar','strsolo','steeldrum','mallet','kalimba','upright','ebass','piano','flute','woodwind'],
 synthpop:[...SYN,'ebass','eguitar','mallet'],
 electronic:[...SYN,'piano'],house:[...SYN,'piano','epiano','eguitar','organ','sax','brass'],deephouse:[...SYN,'epiano','piano','eguitar','vibes','sax'],
 techno:[...SYN],trance:[...SYN,'piano','strings'],synthwave:[...SYN,'eguitar','sax'],futurebass:[...SYN,'piano','kalimba','mallet'],
 dnb:[...SYN,'piano','epiano','strings','upright','vibes'],downtempo:[...SYN,'epiano','piano','acguitar','vibes','kalimba','strings','ebass','sax','flute']};
let GFIT=null,GSIG=null;
// each genre's signature sound: the part that tells you what genre it is always gets one of these families
const SIG={steelpan:{lead:['steeldrum'],keys:['steeldrum','mallet']},mbira:{pulse:['kalimba'],riff:['kalimba','mallet']},marimbag:{pulse:['mallet']},eastasian:{lead:['world','folkpluck']},nordic:{pad:['strings','bowbass'],pulse:['world','harp']},celtic:{keys:['harp']},baroque:{keys:['harpsi']},church:{keys:['organ']},bluegrass:{pulse:['folkpluck']},reggae:{pulse:['eguitar']},meditation:{pad:['glass','vibes']},classicalguitar:{keys:['acguitar'],lead:['acguitar','strsolo']},spanish:{keys:['acguitar'],pulse:['acguitar'],lead:['acguitar','strsolo']},cellosolo:{lead:['strsolo'],keys:['piano','harp']},brooklyn:{keys:['piano','epiano'],pulse:['piano','epiano'],lead:['piano','epiano','vibes','mallet','eguitar']},jazz:{keys:['piano','epiano'],bass:['upright'],lead:['vibes','eguitar','piano','epiano','sax','brass','flute']},
 bossa:{keys:['acguitar'],pulse:['acguitar'],bass:['upright','ebass']},soul:{keys:['epiano','piano','organ'],bass:['ebass']},funk:{keys:['epiano','eguitar','synkeys'],riff:['eguitar','epiano'],bass:['ebass','synbass']},
 lofi:{keys:['epiano','piano'],bass:['upright','ebass']},folk:{keys:['acguitar','harp','piano'],pulse:['acguitar','harp'],lead:['strsolo','acguitar','harp','folkpluck']},
 americana:{keys:['acguitar','piano'],pulse:['acguitar','eguitar','folkpluck'],bass:['upright','ebass']},campfire:{keys:['acguitar'],pulse:['acguitar'],lead:['acguitar','kalimba','mallet','folkpluck','eguitar']},
 cinematic:{pad:['strings'],keys:['piano','harp'],bass:['bowbass','upright','sub'],lead:['strsolo','strings','piano','harp'],counter:['strsolo','strings','piano','harp']},chamber:{pad:['strings'],keys:['piano','harp','harpsi'],lead:['strsolo','piano']},epic:{pad:['strings','synpad']},
 indie:{keys:['piano','epiano','acguitar','eguitar']},drivepop:{keys:['piano','eguitar','acguitar','synth','synkeys']},anthem:{keys:['piano','synth','eguitar']},
 ambient:{pad:['synpad','glass','strings']},synthwave:{lead:['synth'],pad:['synpad'],bass:['synbass']},synthpop:{lead:['synth'],bass:['synbass']},
 house:{keys:['piano','synth','synkeys','organ','epiano'],bass:['synbass']},deephouse:{keys:['epiano','synth','synkeys'],bass:['synbass']},techno:{bass:['synbass','sub']},trance:{lead:['synth'],pad:['synpad']},
 futurebass:{keys:['synth','synpad']},dnb:{bass:['synbass','sub','ebass']},downtempo:{keys:['epiano','piano','synkeys']},electronic:{lead:['synth'],bass:['synbass']},world:{lead:['world','folkpluck','kalimba','steeldrum','strsolo']}};
const fits=x=>!GFIT||GFIT.has(FAMOF(x));
const LOWF=['ebass','upright','synbass','bowbass','sub'],SUSF=['synpad','strings','glass','organ'];
// each part gets an instrument that can actually play that kind of part
const WINDF=['sax','brass','flute','woodwind','harmonica'],LOWW=/tuba|wartuba|bearsax|mtg_bari|bassoon|^bsn/;const roleOK=(x,rn)=>{if(WINDF.includes(FAMOF(x))){if(/^(keys|pulse)/.test(rn))return false;if(LOWW.test(x))return /^(counter|pad)/.test(rn)||/^bass/.test(rn)&&/tuba|wartuba/.test(x);if(/^(bass|sub)/.test(rn))return false}const f=FAMOF(x),art=/_trem|_spic|_sp$|_st$|_stac$|_short$|sec_pizz|solo_pizz|_pl$|cello_pl/.test(x);
 if(/^(bass|sub)/.test(rn))return LOWF.includes(f)||/organ_ped|horsepulse/.test(x);if(/organ_ped|horsepulse/.test(x))return false;if(LOWF.includes(f))return false;
 if(/^pad/.test(rn))return SUSF.includes(f)&&!/_trem|_spic|pizz/.test(x)||/vibes_bow/.test(x)||f=='bowbass'&&!/pizz/.test(x)||f=='synth'&&INS[x][3]=='saw';
 if(/^(lead|counter|dbl)/.test(rn))return!SUSF.includes(f)&&!art&&f!='harpsi';
 if(/^riff/.test(rn))return!SUSF.includes(f)&&!/_trem/.test(x);
 if(/^keys/.test(rn))return!['strings','strsolo','glass','bowbass'].includes(f)&&!art;
 if(/^color/.test(rn))return!/_trem/.test(x);return true};
const ROLEFAM=rn=>/bass|sub/.test(rn)?['ebass','upright','synbass','bowbass','sub']:/pad/.test(rn)?['synpad','strings','glass','organ']:null;

const misfit=(x,rn)=>!fits(x)||!roleOK(x,rn)||MISFIT.some(([g,r,i])=>g.test(GN)&&r.test(rn)&&i.test(x));
function lineup(base,pat,H,used,reg,rn,allowFM){{const kx=KEEP[rn]||KEEP[rn.replace(/2$/,'')];if(kx&&INS[kx]&&!used.has(kx)){WHY[rn]={source:'kept from the previous take'};return kx}}const NV=new Set(['aj_sq','aj_saw','xp_sawpl',...[...NEVER].filter(x=>!isWind(x))]);base=base.filter(x=>!isWind(x));base=base.filter(x=>!NV.has(x)&&(allowFM||!FMKEYS.has(x)));if(!base.length)base=(ALT[rn]||[]).filter(x=>INS[x]);const w=new Map();for(const x of base){if(!INS[x])continue;w.set(x,(w.get(x)||0)+3);const c=CATOF[x];if(c){for(const y of CATL[c])if(!w.has(y)&&fits(y)&&!NV.has(y)&&!isWind(y)&&(allowFM||!FMKEYS.has(y)))w.set(y,.45);if(SHORTPAT.has(pat)&&SHORTOF[c])for(const y of CATL[SHORTOF[c]]||[])if(!w.has(y)&&!NV.has(y)&&!isWind(y))w.set(y,.5)}}
 for(const y of goodFor(rn))if(!w.has(y)&&!NV.has(y)&&(allowFM||!FMKEYS.has(y)))w.set(y,.35);if(GFIT){const rf=ROLEFAM(rn),LOWF=['ebass','upright','synbass','bowbass','sub'];for(const x of Object.keys(INS)){if(w.has(x)||NV.has(x)||isWind(x)||!fits(x)||(!allowFM&&FMKEYS.has(x)))continue;const f=FAMOF(x);if(rf?!rf.includes(f):LOWF.includes(f))continue;w.set(x,.45)}}const SRC={};for(const x of base)SRC[x]='genre band list';for(const[x,v]of w)if(!SRC[x])SRC[x]=goodFor(rn).includes(x)?'genre fit pool':v==.45?'genre-family library pick':'same-family sibling';let ok=[...w].filter(([x])=>!used.has(x)&&INS[x][5]-INS[x][4]>=12&&Math.min(INS[x][5],reg[1]+12)-Math.max(INS[x][4],reg[0]-12)>=12);{const sg=GSIG&&(GSIG[rn]||GSIG[rn.replace(/2$/,'')]);if(sg){let fs=ok.filter(([x])=>sg.includes(FAMOF(x))&&!misfit(x,rn));if(!fs.length)fs=Object.keys(INS).filter(x=>!used.has(x)&&!NV.has(x)&&sg.includes(FAMOF(x))&&!misfit(x,rn)&&INS[x][5]-INS[x][4]>=12&&Math.min(INS[x][5],reg[1]+12)-Math.max(INS[x][4],reg[0]-12)>=12).map(x=>{SRC[x]='genre signature';return[x,1]});if(fs.length)ok=fs}}{let f=ok.filter(([x])=>!misfit(x,rn));if(!f.length&&GFIT){const rf=ROLEFAM(rn);f=Object.keys(INS).filter(x=>!used.has(x)&&!isWind(x)&&!NV.has(x)&&fits(x)&&!misfit(x,rn)&&(!rf||rf.includes(FAMOF(x)))&&(rf||!['ebass','upright','synbass','bowbass','sub'].includes(FAMOF(x)))&&INS[x][5]-INS[x][4]>=12&&Math.min(INS[x][5],reg[1]+12)-Math.max(INS[x][4],reg[0]-12)>=12).map(x=>{SRC[x]='genre family fallback';return[x,.5]})}if(f.length)ok=f}ok=ok.map(([x,v])=>[x,v*Math.pow(.35,AVOID[x]||0)*(FAV&&FAV.has(FAMOF(x))?4.5:1)]);if(!ok.length)return null;let t=ok.reduce((a,b)=>a+b[1],0)*H.rg(0,1);const tw=ok.reduce((a,b)=>a+b[1],0);const why=x=>{WHY[rn]={source:SRC[x],sig:(GSIG&&(GSIG[rn]||GSIG[rn.replace(/2$/,'')])||null),gsig:!!GSIG,candidates:ok.length,share:+((ok.find(o=>o[0]==x)||[0,0])[1]/tw).toFixed(3),recentPenalty:AVOID[x]||0};return x};for(const[x,v]of ok){t-=v;if(t<=0)return why(x)}return why(ok[ok.length-1][0])}
/* ---------- genre blueprints ---------- */
// mix strips: lvl, pan, spread (pitch-to-pan), hpf, lpf, eq [[type f gain q]], comp [thr ratio att rel], sat, mod {t,r,d}, width (Haas ms), verb {t,s}, dly (send), pre (pre-delay)
const STRIP={
 keys:{lvl:.9,pan:-.08,spread:.5,hpf:70,eq:[['p',350,-2,1],['hs',9000,1.5]],comp:[-20,2,.02,.2],sat:.05,verb:{t:'room',s:.22},pre:.02},
 pulse:{lvl:.8,pan:.18,spread:.4,hpf:140,eq:[['p',2500,1.5,1]],verb:{t:'room',s:.25},dly:.08,pre:.025,width:0},
 riff:{lvl:.95,pan:.12,spread:.3,hpf:160,eq:[['p',3000,2,1]],comp:[-18,2.5,.01,.15],verb:{t:'plate',s:.22},dly:.12,pre:.012},
 pad:{lvl:.55,pan:0,spread:0,hpf:120,lpf:12000,eq:[['p',500,-2,.8]],verb:{t:'hall',s:.45},mod:{t:'chorus',d:.22},pre:.045,width:6},
 pad2:{lvl:.4,pan:0,hpf:150,verb:{t:'hall',s:.5},mod:{t:'chorus',d:.3},pre:.05,width:8},
 bass:{lvl:.62,pan:0,hpf:30,lpf:6000,eq:[['p',80,2,1],['p',250,-1.5,1.2]],comp:[-22,3.5,.01,.12],sat:.12,verb:{t:'room',s:.05},pre:.005},
 lead:{lvl:1,pan:.04,hpf:180,eq:[['p',3000,1.5,1],['p',400,-1.5,1]],comp:[-20,2.2,.015,.18],verb:{t:'hall',s:.32},dly:.1,pre:.01},
 color:{lvl:.45,pan:.3,spread:.3,hpf:350,verb:{t:'hall',s:.4},dly:.18,pre:.03},
 counter:{lvl:.55,pan:-.25,hpf:90,verb:{t:'hall',s:.3},pre:.02},
 dbl:{lvl:.32,pan:.3,hpf:500,verb:{t:'hall',s:.4},pre:.03},
 mech:{lvl:.5,pan:0,hpf:80,verb:{t:'room',s:.1}},
 kick:{lvl:.9,hpf:30,eq:[['p',60,3,1],['p',380,-4,1.2],['p',3500,2,1]],comp:[-18,4,.008,.1],verb:{t:'room',s:.04}},
 snare:{lvl:.75,pan:.02,hpf:120,eq:[['p',200,1.5,1],['p',5000,2,1]],comp:[-20,3,.005,.12],verb:{t:'plate',s:.22}},
 hat:{lvl:.45,pan:.32,hpf:400,eq:[['hs',8000,1.5]],verb:{t:'room',s:.08}},
 cym:{lvl:.42,pan:-.28,hpf:300,verb:{t:'room',s:.15}},
 tom:{lvl:.6,spread:.6,hpf:60,verb:{t:'room',s:.15}},
 perc:{lvl:.5,pan:-.35,spread:.5,hpf:200,verb:{t:'room',s:.15}},
 sub:{lvl:.6,pan:0,hpf:22,lpf:140,comp:[-20,3,.01,.15]},
 fx:{lvl:.42,pan:0,hpf:60,verb:{t:'hall',s:.35},pre:.02},
 drums:{lvl:.62}};
const MASTER={glue:[-20,1.6],sat:.12,ex:.07,side:1.08,air:1.5,tilt:0,lp:0,wow:0,vinyl:0,loud:-14};
const G={
cinematic:{n:'Cinematic',d:'Orchestra, piano and horns in a big hall',bpm:[68,96],modes:{maj:2,min:3},sw:0,lag:1,push:.15,color:'cine',prog:'cine',melody:'lyric',kits:['orch','studio'],grooves:['cine'],drumP:.7,under:'light',
 roles:{keys:{pat:['arp8','pianoBallad','sparse'],reg:[48,76],intro:1},pulse:{pat:['ostinato','arp8'],reg:[55,79],intro:1},pad:{pat:['pad'],reg:[48,74],intro:1},bass:{pat:['whole'],reg:[28,52]},lead:{reg:[55,84]},riff:{pat:['riff'],reg:[62,86],intro:1},color:{pat:['sparkle'],reg:[72,100]},counter:{pat:['counter'],reg:[48,67]}},
 bands:[{keys:['grand','steinway'],pulse:['strings','pizz'],pad:['strings'],bass:['contrabass','dbarco'],lead:['horn','cello','violin'],color:['glock','tubular','chimes'],counter:['cello','horn']},
  {keys:['grand','kawai'],pulse:['harp'],pad:['strings'],bass:['dbarco'],lead:['cello','flute','oboe'],riff:['harp','pizz'],color:['chimes','glock']},
  {pulse:['strings'],pad:['strings'],bass:['contrabass','tuba'],lead:['horn','trumpet'],counter:['trombone','cello'],riff:['grand'],color:['tubular']}],
 mix:{pad:{verb:{t:'hall',s:.55},width:8},lead:{verb:{t:'hall',s:.4}},keys:{verb:{t:'hall',s:.3}},pulse:{verb:{t:'hall',s:.35}},kick:{eq:[['p',70,2,1]],verb:{t:'hall',s:.25}},cym:{verb:{t:'hall',s:.35}}},
 fx:{hall:3.8},master:{side:1.05,tilt:0,loud:-15.5}},
folk:{n:'Acoustic Folk',d:'Guitars, cajón, harmonica, upright bass',bpm:[84,112],modes:{maj:4,min:1},sw:.08,push:.3,color:'triad',prog:'folk',melody:'hook',kits:['hand','studio'],alias:{k:'cj',s:'cjs'},grooves:['folk','folk2'],drumP:.85,under:'light',
 roles:{keys:{pat:['strum','fingerpick'],reg:[40,71],guitar:1,intro:1},pulse:{pat:['fingerpick','arp8'],reg:[52,79]},riff:{pat:['riff'],reg:[60,84],intro:1},bass:{pat:['rootFive','whole'],reg:[28,50]},lead:{reg:[60,88]},pad:{pat:['pad'],reg:[52,72]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['steel'],riff:['nylon','strumstick'],bass:['dbpizz','ergo'],lead:['harmonica','violin','harmonica64'],color:['glock']},
  {keys:['nylon'],pulse:['strumstick','harp'],bass:['dbpizz2','dbpizz'],lead:['violin','flute','recorder'],pad:['strings']},
  {keys:['steel'],pulse:['nylon'],bass:['swagbass','dbpizz'],lead:['harmonica','cello'],riff:['strumstick','folkharp']}],
 mix:{keys:{pan:-.28,verb:{t:'room',s:.18}},pulse:{pan:.3},riff:{pan:.25,verb:{t:'room',s:.2}},lead:{verb:{t:'room',s:.28}},drums:{lvl:.55},kick:{eq:[['p',90,2,1],['p',400,-3,1]]},snare:{verb:{t:'room',s:.12}}},
 fx:{room:1.1},master:{side:1,loud:-15.5}},
indie:{n:'Indie Pop',d:'Piano, chorused electric guitar, glockenspiel hooks',bpm:[96,124],modes:{maj:4,min:1},sw:.03,push:.4,color:'pop',prog:'pop',melody:'hook',kits:['studio','pi'],grooves:['pop8','halftime'],drumP:1,under:'full',
 roles:{keys:{pat:['block','arp8'],reg:[50,74],intro:1},pulse:{pat:['arp8','pluckPulse','arp16'],reg:[55,79],intro:1},riff:{pat:['riff'],reg:[67,91],intro:1},bass:{pat:['eighths','pulse8','syncopated'],reg:[28,50]},pad:{pat:['pad'],reg:[52,74]},lead:{reg:[64,90]},color:{pat:['sparkle'],reg:[79,103]}},
 bands:[{keys:['kawai','grand'],pulse:['eguitar'],riff:['glock','xylo'],bass:['jazzbass','swagbass'],pad:['strings'],color:['chimes']},
  {keys:['knight','kawai'],pulse:['eguitar','marimba'],riff:['vibeshard','glock'],bass:['swagbass'],lead:['trumpet','recorder']},
  {keys:['grand'],pulse:['steel'],riff:['eguitar','glock'],bass:['jazzbass'],pad:['strings'],lead:['violin']}],
 mix:{pulse:{mod:{t:'chorus',d:.3},dly:.2,width:4,pan:.32},riff:{verb:{t:'plate',s:.25},dly:.2},keys:{pan:-.2},snare:{verb:{t:'plate',s:.3}}},
 fx:{plate:2,dly:{div:.75,fb:.3}},master:{side:1.12,tilt:.3,loud:-14.5}},
soul:{n:'Neo-Soul',d:'Wurlitzer, electric bass, sax, swung pocket',bpm:[70,92],modes:{maj:3,min:2},sw:.46,lag:1.7,push:.5,color:'soul',prog:'soul',melody:'hook',blue:.08,kits:['pi','studio'],grooves:['lofi','pop8'],drumP:1,under:'full',
 roles:{keys:{pat:['block24','rootless','block'],reg:[50,74],intro:1},riff:{pat:['riff'],reg:[60,84],intro:1},bass:{pat:['syncopated','pulse8'],reg:[28,50]},lead:{reg:[56,84]},pad:{pat:['pad'],reg:[52,72]},color:{pat:['sparkle'],reg:[72,96]},pulse:{pat:['pluckPulse'],reg:[55,76]}},
 bands:[{keys:['wurli'],riff:['eguitar'],bass:['swagbass','jazzbass'],lead:['tenorsax','saxello'],color:['vibes']},
  {keys:['cp80','pianet'],riff:['eguitar','vibes'],bass:['jazzbass'],lead:['mutetpt','tenorsax','flute'],pad:['strings']},
  {keys:['wurli','grand'],pulse:['eguitar'],bass:['swagbass'],lead:['saxello','harmonica64'],color:['vibes']}],
 mix:{keys:{mod:{t:'trem',r:5.2,d:.22},sat:.15,verb:{t:'plate',s:.2}},riff:{mod:{t:'chorus',d:.3},pan:.3,verb:{t:'plate',s:.22}},lead:{verb:{t:'plate',s:.28},sat:.08},bass:{sat:.18},snare:{verb:{t:'plate',s:.25}},hat:{lvl:.38}},
 fx:{plate:1.8},master:{sat:.2,tilt:-.4,side:1.05,loud:-15}},
lofi:{n:'Lo-fi',d:'Dusty upright, tape wobble, vinyl, lazy swing',bpm:[70,86],modes:{maj:2,min:2},sw:.6,lag:2,push:.5,color:'lofi',prog:'lofi',melody:'hook',kits:['pi','studio'],grooves:['lofi','lofi2'],drumP:1,under:'full',
 roles:{keys:{pat:['stab','sparse','block'],reg:[50,74],intro:1},riff:{pat:['riff'],reg:[62,84],intro:1},bass:{pat:['lofiBass','whole'],reg:[28,48]},lead:{p:.5,reg:[62,86]},color:{pat:['sparkle'],reg:[72,94]}},
 bands:[{keys:['knight','felt'],riff:['vibes','nylon'],bass:['dbpizz','jazzbass'],color:['kalimba']},{keys:['pianet','wurli'],riff:['nylon','kalimba'],bass:['jazzbass'],lead:['flute']},{keys:['felt'],riff:['eguitar','vibes'],bass:['dbpizz'],lead:['saxello']}],
 mix:{keys:{lpf:7000,sat:.2,pan:-.24,spread:.6,verb:{t:'room',s:.24}},riff:{lpf:8000,pan:.3,verb:{t:'room',s:.24}},color:{pan:-.35},bass:{lpf:3000},lead:{lpf:7000},kick:{lpf:6000,sat:.25},snare:{lpf:7000,verb:{t:'room',s:.18}},hat:{lpf:7000,lvl:.38}},
 fx:{room:.9},master:{lp:9500,wow:1,vinyl:.6,sat:.28,side:1.2,tilt:-1.2,loud:-15.5}},
jazz:{n:'Late-Night Jazz',d:'Piano trio, walking bass, vibes or horn',bpm:[96,136],modes:{maj:3,min:1},sw:.62,lag:1.3,push:.35,color:'jazz',prog:'jazz',melody:'hook',blue:.1,kits:['pi','orch','studio'],alias:{s:'ss'},grooves:['swing'],drumP:1,under:'full',
 roles:{keys:{pat:['rootless'],reg:[50,74],intro:1},bass:{pat:['walking'],reg:[28,52]},lead:{reg:[58,86]},riff:{pat:['riff'],reg:[60,84],intro:1},color:{p:.3,pat:['sparkle'],reg:[72,94]}},
 bands:[{keys:['steinway','grand'],bass:['dbpizz','dbpizz2'],lead:['vibes','mutetpt','tenorsax']},{keys:['kawai','steinway'],bass:['dbpizz'],riff:['vibes'],lead:['tenorsax','flute']},{keys:['grand'],bass:['ergo','dbpizz'],riff:['eguitar'],lead:['mutetpt','clarinet']}],
 mix:{keys:{spread:.7,verb:{t:'chamber',s:.22}},lead:{verb:{t:'chamber',s:.28}},bass:{verb:{t:'chamber',s:.08}},cym:{lvl:.5,pan:.3},hat:{pan:-.2}},
 fx:{chamber:1.7},master:{side:1,tilt:-.3,loud:-16}},
ambient:{n:'Ambient',d:'Felt piano, glass, chimes and long space',bpm:[60,76],modes:{maj:2,lyd:1,min:1},sw:0,push:.1,color:'lofi',prog:'ambient',melody:'lyric',kits:[],grooves:[],drumP:0,
 roles:{keys:{pat:['sparse'],reg:[52,79],intro:1},pad:{pat:['pad'],reg:[48,74],intro:1},bass:{p:.7,pat:['pedal','whole'],reg:[28,50]},lead:{p:.6,reg:[62,88]},color:{pat:['sparkle'],reg:[72,96]},counter:{p:.5,pat:['counter'],reg:[50,70]}},
 bands:[{keys:['felt','knight'],pad:['strings','wineglass'],bass:['dbarco'],lead:['recorder','flute','psaltery'],color:['chimes','kalimba','vibes']},{keys:['felt'],pad:['strings'],bass:['dbarco','contrabass'],counter:['cello'],color:['wineglass','chimes']},{keys:['harp','folkharp'],pad:['strings','wineglass'],lead:['psaltery','ocarina'],color:['vibes']}],
 mix:{pad:{verb:{t:'hall',s:.62},mod:{t:'chorus',d:.18},width:0},keys:{verb:{t:'hall',s:.42},dly:.16},color:{dly:.35,verb:{t:'hall',s:.6}},lead:{verb:{t:'hall',s:.55},dly:.25}},
 fx:{hall:5.5,dly:{div:1.5,fb:.42}},master:{side:.95,tilt:-.4,loud:-16}},
bossa:{n:'Bossa & Latin',d:'Nylon bossa comping, flute, hand percussion',bpm:[118,140],modes:{maj:3,min:1},sw:.04,push:.45,color:'bossa',prog:'bossa',melody:'hook',kits:['studio','hand','pi'],grooves:['bossa'],drumP:1,under:'full',
 roles:{keys:{pat:['bossaComp'],reg:[48,72],guitar:1,intro:1},bass:{pat:['bossaBass'],reg:[28,50]},lead:{reg:[62,90]},riff:{pat:['riff'],reg:[62,86]},color:{pat:['sparkle'],reg:[72,96]},pad:{p:.4,pat:['pad'],reg:[52,72]}},
 bands:[{keys:['nylon'],bass:['ergo','dbpizz'],lead:['flute','saxello'],color:['vibes']},{keys:['nylon'],bass:['dbpizz'],riff:['vibes','marimba'],lead:['flute','tenorsax'],pad:['strings']},{keys:['nylon'],bass:['jazzbass'],lead:['mutetpt','clarinet'],riff:['kawai']}],
 mix:{keys:{pan:-.15,verb:{t:'room',s:.15}},lead:{verb:{t:'plate',s:.22}},perc:{lvl:.55}},
 fx:{room:1},master:{side:1,loud:-15.5}},
americana:{n:'Americana',d:'Upright piano, steel guitar, organ, harmonica',bpm:[76,104],modes:{maj:4,min:1},sw:.14,lag:1.3,push:.3,color:'gospel',prog:'gospel',melody:'hook',kits:['studio','hand'],grooves:['gospel','brush'],drumP:.9,under:'light',
 roles:{keys:{pat:['block24','pianoBallad'],reg:[50,74],intro:1},pulse:{pat:['strum'],reg:[40,71],guitar:1},pad:{pat:['pad'],reg:[48,72]},bass:{pat:['rootFive'],reg:[28,50]},lead:{reg:[60,88]},riff:{pat:['riff'],reg:[60,84]}},
 bands:[{keys:['yamaha_up','knight'],pulse:['steel'],pad:['renorgan','pipeorgan'],bass:['swagbass'],lead:['harmonica','harmonica64']},{keys:['steinway'],pulse:['steel'],bass:['dbpizz'],lead:['violin','harmonica'],riff:['nylon']},{keys:['yamaha_up'],pad:['pipeorgan'],bass:['swagbass','jazzbass'],riff:['eguitar'],lead:['trumpet','harmonica64']}],
 mix:{pulse:{pan:.3,verb:{t:'spring',s:.22}},riff:{verb:{t:'spring',s:.25}},pad:{lvl:.42,mod:{t:'rotary',r:.9,d:.5},verb:{t:'room',s:.25}},keys:{pan:-.2},snare:{verb:{t:'plate',s:.2}}},
 fx:{spring:1.8},master:{loud:-15}},
synthpop:{n:'Retro Synth-Pop',d:'Real Yamaha TX81Z FM synth and Roland TR-808',bpm:[100,124],modes:{maj:3,min:2},sw:0,push:.45,color:'pop',prog:'pop',melody:'hook',kits:['linn9k','dmx','tr808'],grooves:['synth','fourfloor','synthwave2'],drumP:1,under:'full',fm:1,edm:{uni:{pad:3},wall:0,build:0,sweep:0,riser:0,sub:[],dbl:['a4_fm'],ott:{}},
 roles:{keys:{pat:['block','stab'],reg:[50,74],intro:1},pulse:{pat:['arp16','pluckPulse'],reg:[55,79],intro:1},riff:{pat:['riff'],reg:[64,88],intro:1},bass:{pat:['eighths','pulse8'],reg:[28,52]},pad:{pat:['pad'],reg:[52,76]},color:{pat:['sparkle'],reg:[79,103]}},
 bands:[{keys:['jx_piano','fmpiano'],pulse:['j6_pwpl','fmclav'],riff:['esq_bell','glock'],bass:['j6_pulse','jx_snap'],pad:['jp4_pwm','j6_open']},{keys:['jp4_brass','jx_big'],pulse:['jd_pluck'],riff:['a4_fm'],bass:['mg1_moog','k3_solid'],pad:['jx_strings']},{keys:['fmpiano','fmpiano2'],pulse:['fmclav'],riff:['glock','xylo'],bass:['bassvi','jazzbass'],pad:['strings']},{keys:['fmpiano2'],pulse:['eguitar'],riff:['fmclav'],bass:['swagbass','bassvi'],color:['glock']},{keys:['cp80'],pulse:['fmclav'],riff:['vibeshard'],bass:['bassvi']}],
 mix:{keys:{mod:{t:'chorus',d:.3},width:4,verb:{t:'plate',s:.3}},pulse:{dly:.28,pan:.3,mod:{t:'chorus',d:.25}},riff:{verb:{t:'plate',s:.3},dly:.22},bass:{sat:.2},snare:{verb:{t:'plate',s:.38}},kick:{eq:[['p',55,3,1],['p',350,-4,1]]}},
 fx:{plate:2.4,dly:{div:.75,fb:.35}},master:{side:.98,tilt:.4,sat:.15,loud:-14.5}},
world:{n:'World Fusion',d:'Kalimba, Đàn tranh, darbuka, tabla, flutes',bpm:[90,116],modes:{dor:2,min:2,mix:1},sw:.06,push:.35,color:'triad',prog:'modal',melody:'hook',kits:['hand','tabla','studio'],grooves:['darbuka','tabla','world'],drumP:1,under:'full',
 roles:{pulse:{pat:['ostinato','arp332'],reg:[59,81],intro:1},riff:{pat:['riff'],reg:[60,84],intro:1},bass:{pat:['syncopated','rootFive'],reg:[28,50]},lead:{reg:[64,88]},pad:{p:.6,pat:['pad'],reg:[50,72]},keys:{p:.5,pat:['fingerpick'],reg:[40,71],guitar:1}},
 bands:[{pulse:['kalimba'],riff:['dantranh'],bass:['ergo'],lead:['ocarina','flute'],pad:['strings']},{pulse:['marimba','kalimba'],riff:['nylon','dantranh'],bass:['dbpizz'],lead:['recorder','saxello']},{pulse:['dantranh'],keys:['nylon'],bass:['ergo','swagbass'],lead:['flute','oboe'],riff:['kalimba']}],
 mix:{pulse:{pan:-.2,verb:{t:'room',s:.22}},riff:{pan:.25},lead:{verb:{t:'hall',s:.3}},perc:{lvl:.6,spread:.8}},
 fx:{room:1.2},master:{loud:-15.5}},
classicalguitar:{n:'Classical Guitar',d:'Solo nylon-string guitar: bass and melody from one player, fingerpicked arpeggios, an intimate room, free rubato',bpm:[64,92],modes:{maj:3,min:3},sw:0,push:.1,color:'triad',prog:'folk',melody:'lyric',kits:[],grooves:[],drumP:0,solo:1,
 roles:{keys:{keep:1,pat:['pima','fingerpick'],reg:[40,74],guitar:1,intro:1},lead:{reg:[57,81]},bass:{p:.25,pat:['whole'],reg:[31,48]}},
 bands:[{keys:['nylon'],lead:['nylon'],bass:['dbpizz2']},{keys:['nylon'],lead:['nylon']},{keys:['nylon'],lead:['nylon','cello']}],
 mix:{keys:{pan:-.12,verb:{t:'room',s:.22}},lead:{pan:.1,verb:{t:'room',s:.24}}},fx:{room:1.3},master:{side:.95,tilt:.1,loud:-15.5}},
spanish:{n:'Spanish Guitar',d:'Flamenco-flavoured nylon guitar: Andalusian cadence, rasgueado bursts on the 12-beat accents, falseta runs, cajón',bpm:[96,128],modes:{min:1},sw:0,push:.35,color:'triad',prog:'flamenco',melody:'lyric',kits:['hand','studio'],alias:{k:'cj',s:'cjs'},grooves:['folk2','folk'],drumP:.55,under:'light',solo:1,
 roles:{keys:{keep:1,pat:['rasg'],reg:[40,71],guitar:1,intro:1},pulse:{p:.7,pat:['pima'],reg:[47,76]},bass:{p:.6,pat:['rootFive','whole'],reg:[28,48]},lead:{reg:[57,84]}},
 bands:[{keys:['nylon'],pulse:['nylon'],lead:['nylon'],bass:['dbpizz','dbpizz2']},{keys:['nylon'],lead:['nylon','violin'],bass:['dbpizz2']},{keys:['nylon'],pulse:['nylon'],lead:['nylon']}],
 mix:{keys:{pan:-.2,verb:{t:'room',s:.18},comp:[-20,2.5,.004,.12]},pulse:{pan:.25,verb:{t:'room',s:.2}},lead:{verb:{t:'room',s:.25}},drums:{lvl:.5}},fx:{room:1.2},master:{side:1,loud:-15}},
cellosolo:{n:'Cello Solo',d:'A singing solo cello over piano or harp, long breaths, slides and blooming vibrato, free rubato',bpm:[58,82],modes:{min:3,maj:2},sw:0,push:.05,color:'cine',prog:'cine',melody:'lyric',kits:[],grooves:[],drumP:0,
 roles:{lead:{reg:[45,74]},keys:{keep:1,pat:['sparse','arp8'],reg:[45,76],intro:1},bass:{p:.6,pat:['whole'],reg:[29,48]},pad:{p:.35,pat:['pad'],reg:[50,70]}},
 bands:[{lead:['cello','bigcat_cello'],keys:['steinway','grand','felt'],bass:['dbarco','contrabass'],pad:['strings']},{lead:['bigcat_cello','cello'],keys:['concert_harp2','harp'],bass:['cb_solo_arco'],pad:['vc_sec']},{lead:['cello'],keys:['splendid','kawai'],bass:['dbarco']}],
 mix:{lead:{pan:.05,verb:{t:'hall',s:.32},pre:.03},keys:{pan:-.18,verb:{t:'hall',s:.3}},pad:{verb:{t:'hall',s:.4}}},fx:{hall:2.8},master:{side:.95,tilt:.15,loud:-15.5}},
steelpan:{n:'Steel Pan',d:'Caribbean steel pan melodies and rolled chords, strummed guitar, congas, cowbell and shaker',bpm:[96,124],modes:{maj:4,min:1},sw:.1,push:.35,color:'pop',prog:'pop',melody:'hook',kits:['hand'],grooves:['calypso','calypso2'],drumP:1,solo:1,
 roles:{lead:{reg:[60,84]},keys:{keep:1,pat:['panroll'],reg:[57,79]},pulse:{keep:1,pat:['strum'],reg:[40,71],guitar:1,intro:1},bass:{pat:['rootFive','eighths'],reg:[28,50]}},
 bands:[{lead:['steeldrum'],keys:['steeldrum'],pulse:['steel','nylon'],bass:['jazzbass','dbpizz']},{lead:['steeldrum'],keys:['marimba'],pulse:['nylon','shiny_ac'],bass:['swagbass','babyblue']}],
 mix:{lead:{verb:{t:'room',s:.22}},keys:{pan:-.25,verb:{t:'room',s:.2}},pulse:{pan:.3,verb:{t:'room',s:.15}},drums:{lvl:.6}},fx:{room:1.1},master:{side:1,loud:-14.5}},
mbira:{n:'Mbira',d:'Zimbabwean mbira and kalimba interlocking patterns, marimba, hosho shaker and hand drums',bpm:[100,132],modes:{maj:3,min:1},sw:.06,push:.3,color:'triad',prog:'folk',melody:'hook',kits:['hand'],grooves:['mbira','mbira2'],drumP:.85,
 roles:{pulse:{keep:1,pat:['mbiraA'],reg:[48,76],intro:1},riff:{keep:1,pat:['mbiraB'],reg:[55,81]},lead:{reg:[60,84]},bass:{p:.7,pat:['rootFive'],reg:[30,50]}},
 bands:[{pulse:['mbira_b'],riff:['mbira_g'],lead:['kalimba'],bass:['dbpizz']},{pulse:['kalimba_t'],riff:['kalimba'],lead:['marimba'],bass:['dbpizz2']},{pulse:['mbira_g'],riff:['marimba_vsco'],lead:['mbira_b']}],
 mix:{pulse:{pan:-.3,verb:{t:'room',s:.2}},riff:{pan:.3,verb:{t:'room',s:.2}},drums:{lvl:.6}},fx:{room:1.1},master:{side:1,loud:-15}},
marimbag:{n:'Marimba Groove',d:'Layered marimba and xylophone ostinatos, soft vibes, hand percussion',bpm:[92,120],modes:{maj:3,min:2},sw:.04,push:.3,color:'pop',prog:'pop',melody:'hook',kits:['hand'],grooves:['marimbag','world'],drumP:.9,
 roles:{pulse:{keep:1,pat:['ostinato'],reg:[48,76],intro:1},riff:{keep:1,pat:['ostinato'],reg:[60,84]},keys:{p:.6,pat:['block'],reg:[52,74]},lead:{reg:[62,86]},bass:{pat:['rootFive'],reg:[28,50]}},
 bands:[{pulse:['marimba'],riff:['xylo_soft'],keys:['vibes'],lead:['marimba_vsco'],bass:['dbpizz']},{pulse:['marimba_vsco'],riff:['marimba'],lead:['vibes'],bass:['jazzbass']}],
 mix:{pulse:{pan:-.25},riff:{pan:.3},keys:{verb:{t:'room',s:.25}},drums:{lvl:.6}},fx:{room:1},master:{side:1,loud:-15}},
eastasian:{n:'East Asian Calm',d:'Đàn tranh zither with tremolo and vibrato, erhu, harp and soft bells; pentatonic and spacious',bpm:[60,84],modes:{maj:3,min:2},penta:1,sw:0,push:.1,color:'triad',prog:'folk',melody:'lyric',kits:['hand'],grooves:['zen','zen2'],drumP:.45,under:'light',
 roles:{lead:{reg:[57,81]},keys:{keep:1,pat:['sparse','arp8'],reg:[50,79],intro:1},pad:{p:.5,pat:['pad'],reg:[50,70]},counter:{p:.6,pat:['counter'],reg:[55,74]},bass:{p:.5,pat:['whole'],reg:[33,50]}},
 bands:[{lead:['erhu','dantranh_vib'],keys:['dantranh','harp'],pad:['strings'],counter:['dantranh_trem'],bass:['dbpizz2']},{lead:['dantranh_vib','dantranh'],keys:['harp','concert_harp2'],pad:['wineglass'],counter:['erhu'],bass:['dbarco']}],
 mix:{lead:{verb:{t:'hall',s:.3}},keys:{verb:{t:'hall',s:.28}},pad:{verb:{t:'hall',s:.4}}},fx:{hall:2.6},master:{side:.95,tilt:.1,loud:-15.5}},
nordic:{n:'Nordic Folk',d:'Tagelharpa and bowed drones, lyre, folk harp, frame-drum heartbeat, cold open space',bpm:[70,96],modes:{min:3,dor:2},sw:0,push:.15,color:'triad',prog:'modal',melody:'lyric',kits:['hand'],grooves:['nordic','nordic2'],drumP:.8,under:'light',
 roles:{pad:{keep:1,pat:['pad'],reg:[38,62]},pulse:{keep:1,pat:['fingerpick','arp8'],reg:[48,76],intro:1},lead:{reg:[55,79]},bass:{pat:['whole'],reg:[28,48]},counter:{p:.4,pat:['counter'],reg:[50,70]}},
 bands:[{pad:['contrabass','vc_sec'],pulse:['cithara_f','folkharp'],lead:['erhu','psaltery'],bass:['horsepulse']},{pad:['vc_sec'],pulse:['folkharp','cithara_n'],lead:['psaltery','violin'],bass:['dbarco'],counter:['cello']}],
 mix:{pad:{verb:{t:'hall',s:.45}},lead:{verb:{t:'hall',s:.35}},pulse:{verb:{t:'hall',s:.3}},drums:{lvl:.65}},fx:{hall:3.2},master:{side:.95,tilt:-.1,loud:-15.5}},
celtic:{n:'Celtic Harp',d:'Concert and folk harp, fiddle, bodhrán-style frame drum, upright bass',bpm:[76,112],modes:{maj:3,min:2,mix:1},sw:.06,push:.25,color:'triad',prog:'folk',melody:'lyric',kits:['hand'],grooves:['celtic','celtic2'],drumP:.7,under:'light',
 roles:{keys:{keep:1,pat:['arp8','fingerpick'],reg:[45,79],intro:1},lead:{reg:[60,86]},bass:{p:.7,pat:['rootFive','whole'],reg:[31,50]},counter:{p:.5,pat:['counter'],reg:[52,72]}},
 bands:[{keys:['harp','concert_harp2'],lead:['violin','folkharp'],bass:['dbpizz'],counter:['cello']},{keys:['folkharp'],lead:['harp','violin'],bass:['dbpizz2']}],
 mix:{keys:{verb:{t:'hall',s:.3}},lead:{verb:{t:'hall',s:.3}},drums:{lvl:.55}},fx:{hall:2.4},master:{side:1,loud:-15.5}},
baroque:{n:'Baroque',d:'Harpsichord continuo, string sections, bowed bass line, chamber organ, terraced dynamics',bpm:[80,116],modes:{maj:3,min:2},sw:0,push:.2,color:'triad',prog:'folk',melody:'lyric',kits:[],grooves:[],drumP:0,
 roles:{keys:{keep:1,pat:['alberti','arp8'],reg:[48,79],intro:1},pad:{keep:1,p:.7,pat:['pad'],reg:[52,76]},bass:{pat:['eighths','rootFive'],reg:[31,52]},lead:{reg:[62,88]},counter:{p:.7,pat:['counter'],reg:[48,67]}},
 bands:[{keys:['harpsi','hpsi_it','hpsi_fr'],pad:['strings'],bass:['contrabass','dbarco'],lead:['violin'],counter:['cello']},{keys:['hpsi_flfull','hpsi_eng'],pad:['renorgan'],bass:['cb_solo_arco'],lead:['violin'],counter:['vla_sec']}],
 mix:{keys:{pan:-.15,verb:{t:'hall',s:.25}},pad:{verb:{t:'hall',s:.35}},lead:{verb:{t:'hall',s:.3}}},fx:{hall:2.4},master:{side:.95,tilt:.15,loud:-15.5}},
church:{n:'Church Organ',d:'Pipe organ hymn chords with pedal bass, strings, a reverent cathedral space',bpm:[60,84],modes:{maj:4,min:1},sw:0,push:.05,color:'triad',prog:'folk',melody:'lyric',kits:[],grooves:[],drumP:0,
 roles:{keys:{keep:1,pat:['block','pad'],reg:[50,74],intro:1},bass:{pat:['whole'],reg:[24,48]},pad:{p:.6,pat:['pad'],reg:[52,76]},lead:{reg:[60,84]}},
 bands:[{keys:['organ_loud','renorgfull'],bass:['organ_ped'],pad:['strings'],lead:['renorg4','cello']},{keys:['renorgan'],bass:['organ_ped','contrabass'],pad:['vc_sec'],lead:['violin','cello']}],
 mix:{keys:{verb:{t:'hall',s:.5}},bass:{verb:{t:'hall',s:.4}},lead:{verb:{t:'hall',s:.45}},pad:{verb:{t:'hall',s:.5}}},fx:{hall:4},master:{side:.95,tilt:.1,loud:-15.5}},
bluegrass:{n:'Bluegrass',d:'Banjo rolls, flatpicked steel guitar, fiddle, upright bass on the beat',bpm:[104,140],modes:{maj:4,mix:1},sw:.04,push:.45,color:'triad',prog:'folk',melody:'hook',kits:['studio','hand'],grooves:['bluegrass','folk2'],drumP:.4,
 roles:{pulse:{keep:1,pat:['bjroll'],reg:[55,79],intro:1},keys:{keep:1,pat:['strum'],reg:[40,71],guitar:1},lead:{reg:[60,86]},bass:{pat:['rootFive'],reg:[28,50]}},
 bands:[{pulse:['ganjo'],keys:['steel','shiny_ac'],lead:['violin'],bass:['dbpizz','sneaky']},{pulse:['ganjo'],keys:['steel'],lead:['violin','vln_solo_spic'],bass:['dbpizz2']}],
 mix:{pulse:{pan:.25,verb:{t:'room',s:.15}},keys:{pan:-.25,verb:{t:'room',s:.15}},lead:{verb:{t:'room',s:.22}},drums:{lvl:.5}},fx:{room:1},master:{side:1,loud:-14.5}},
reggae:{n:'Reggae',d:'Offbeat guitar skank, keyboard bubble, deep round bass, one-drop drums',bpm:[68,84],modes:{maj:3,min:2},sw:.12,lag:.6,push:.3,color:'pop',prog:'pop',melody:'hook',kits:['studio','pi'],grooves:['reggae','reggae2','reggae3'],drumP:1,under:'full',
 roles:{pulse:{keep:1,pat:['skank'],reg:[55,76],intro:1},keys:{keep:1,pat:['bubble'],reg:[52,74]},bass:{pat:['rootFive','whole'],reg:[28,48]},lead:{reg:[60,84]}},
 bands:[{pulse:['eguitar','shiny_el'],keys:['pianet','wurli'],bass:['jazzbass','pasta_fet'],lead:['vibes','steinway']},{pulse:['green_stac','black_stac'],keys:['wurli'],bass:['darkblack_warm','fashion'],lead:['eguitar','vibes']}],
 mix:{pulse:{pan:.3,verb:{t:'spring',s:.2}},keys:{pan:-.3,verb:{t:'room',s:.15}},bass:{eq:[['p',70,3,1],['p',700,-2,1]]},snare:{verb:{t:'plate',s:.25}},drums:{lvl:.7}},fx:{room:1},master:{side:1,tilt:-.2,loud:-14}},
meditation:{n:'Glass & Bells',d:'Wine glasses, bowed vibraphone, hand chimes, felt piano, Nepalese bells, deep stillness',bpm:[56,76],modes:{maj:3,min:2},sw:0,push:0,color:'triad',prog:'ambient',melody:'lyric',kits:['hand'],grooves:['meditation','meditation2'],drumP:.6,under:'light',
 roles:{pad:{keep:1,pat:['pad'],reg:[50,76],intro:1},keys:{pat:['sparse'],reg:[50,79]},color:{pat:['sparkle'],reg:[72,93]},lead:{reg:[60,84]},bass:{p:.4,pat:['whole'],reg:[33,50]}},
 bands:[{pad:['wineglass','wineglass_f'],keys:['felt'],color:['chimes'],lead:['vibes','kalimba'],bass:['dbarco']},{pad:['vibes_bow'],keys:['felt','harp'],color:['chimes','glock'],lead:['kalimba','vibes']}],
 mix:{pad:{verb:{t:'hall',s:.5}},keys:{verb:{t:'hall',s:.4}},color:{verb:{t:'hall',s:.5}},lead:{verb:{t:'hall',s:.4}},drums:{lvl:.45}},fx:{hall:4},master:{side:.95,tilt:.1,loud:-16}},
chamber:{n:'Chamber',d:'Harp, pizzicato, strings and woodwinds',bpm:[84,112],modes:{maj:4,min:1},sw:0,push:.2,color:'triad',prog:'pop',melody:'lyric',kits:[],grooves:[],drumP:0,
 roles:{pulse:{pat:['arp8','alberti'],reg:[55,79],intro:1},pad:{p:.8,pat:['pad'],reg:[52,74]},bass:{pat:['whole','rootFive'],reg:[33,55]},lead:{reg:[62,90]},counter:{p:.8,pat:['counter'],reg:[48,67]},riff:{p:.5,pat:['riff'],reg:[62,86]}},
 bands:[{pulse:['harp','pizz'],pad:['strings'],bass:['cello'],lead:['flute','oboe','clarinet'],counter:['bassoon','clarinet']},{pulse:['harpsi','harp'],pad:['strings'],bass:['cello','bassoon'],lead:['violin','oboe'],counter:['horn']},{pulse:['pizz'],pad:['strings'],bass:['contrabass'],lead:['clarinet','flute'],riff:['harp'],counter:['cello']}],
 mix:{pad:{verb:{t:'hall',s:.45}},lead:{verb:{t:'hall',s:.35}}},
 fx:{hall:3},master:{side:.95,tilt:.2,loud:-15.5}},
funk:{n:'Feel-Good Funk',d:'Clavinet and Wurlitzer chops, popping bass, horns, ghost-note groove',bpm:[86,100],modes:{mix:3,dor:2,maj:1},sw:.04,sw16:.22,lag:.8,push:.4,color:'funk',prog:'funk',melody:'hook',kits:['pi','studio'],grooves:['funk','funk2'],drumP:1,under:'full',fill:1,arc:1,
 roles:{keys:{pat:['chop16'],reg:[55,79],intro:1},pulse:{pat:['chop16b'],reg:[59,83]},bass:{pat:['funk'],reg:[28,50]},riff:{pat:['riff'],reg:[60,84],enter:2},lead:{reg:[58,84]},color:{pat:['hornStab'],reg:[55,79],enter:4}},
 bands:[{keys:['wurli'],pulse:['eguitar'],bass:['jazzbass','swagbass'],lead:['tenorsax','saxello'],riff:['fmclav'],color:['trumpet']},
  {keys:['fmclav'],pulse:['eguitar'],bass:['jazzbass'],lead:['trumpet','tenorsax'],riff:['wurli'],color:['trombone','trumpet']},
  {keys:['grand','steinway'],pulse:['fmclav'],bass:['swagbass','jazzbass'],lead:['tenorsax','harmonica'],riff:['vibes'],color:['trumpet']}],
 mix:{keys:{pan:-.3,sat:.12,verb:{t:'room',s:.14},comp:[-22,3,.005,.1]},pulse:{pan:.35,verb:{t:'room',s:.12}},bass:{sat:.22,comp:[-24,4,.005,.1],eq:[['p',90,2.5,1],['p',800,1.5,1.2]]},color:{verb:{t:'room',s:.2}},lead:{verb:{t:'plate',s:.22}},snare:{verb:{t:'room',s:.14}},drums:{lvl:.7}},
 fx:{room:.9},master:{side:.92,tilt:-.2,sat:.16,loud:-14}},
electronic:{n:'EDM',d:'Festival wall of sound: unison supersaw stacks (JX-3P, Xpander, Chroma Polaris, System 100), Juno and JD-800 plucks, Jupiter-4 and JD-800 leads, a sub layer, real TR-909, builds with risers, snare rolls, filter sweeps and impacts, heavy sidechain',bpm:[120,128],modes:{min:3,maj:2},sw:0,sw16:0,push:.45,color:'pop',prog:'pop',melody:'hook',kits:['tr909','tr808'],grooves:['edm','edm2','bigroom'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.62,fm:1,
 edm:{uni:{pad:5,pad2:3,keys:3,lead:3},wall:1,build:1,sweep:1,riser:1,sub:['hs_plastic','sh2_ghost','j6_short','k3_solid'],dbl:['a4_fm','esq_bell','j6_rich'],ott:{pad:.4,pad2:.35,keys:.3,pulse:.3,lead:.25}},
 roles:{keys:{pat:['offstab'],reg:[55,79]},pad:{pat:['saw'],reg:[48,79],intro:1},pad2:{pat:['pad'],reg:[55,84],intro:1},pulse:{pat:['pluck16'],reg:[60,86],enter:1},bass:{pat:['offBass','roll16','houseBass'],reg:[28,48]},lead:{reg:[62,90]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{pad:['cp_bigbad','s100_saw4'],pad2:['jp4_unison','un_lush'],keys:['jx_rave','jx_big'],pulse:['j6_pwpl','jd_pluck'],bass:['mb_sharp','j6_pulse'],lead:['jd_bright','jp4_bold'],color:['a4_fm']},
  {pad:['xp_bigstack','jx_big'],pad2:['jp4_pwm','cp_pwmstack'],keys:['jx_rave'],pulse:['z1_plucky','j6_rich'],bass:['a4_blip','esq_bass'],lead:['cp_wow','jd_orange'],color:['esq_bell']},
  {pad:['aj_chsaw','a4_stacker'],pad2:['jx_strings','j6_new'],keys:['jx_big'],pulse:['jd_pluck','xp_sawpl'],bass:['un_mgbass','z1_brassbass'],lead:['s100_lead','xp_phase'],color:['a4_fm']}],
 mix:{pad:{lvl:.62,hpf:180,mod:{t:'chorus',d:.32},width:10,verb:{t:'hall',s:.42},pre:.03},pad2:{lvl:.42,hpf:260,mod:{t:'chorus',d:.35},width:12,verb:{t:'hall',s:.5}},keys:{hpf:200,mod:{t:'chorus',d:.25},width:6,verb:{t:'plate',s:.3},dly:.15},pulse:{hpf:250,dly:.3,verb:{t:'plate',s:.28},width:4},lead:{dly:.2,verb:{t:'hall',s:.36},sat:.08},bass:{lpf:5500,sat:.25,comp:[-24,4,.005,.1]},kick:{eq:[['p',55,3,1],['p',380,-4,1.2],['p',4000,2,1]],sat:.18},drums:{lvl:.82},hat:{lvl:.62,hpf:450,eq:[['hs',8000,2.5]],verb:{t:'room',s:.08}},snare:{lvl:.85,hpf:150,eq:[['p',220,1.5,1],['p',5500,2.5,1]],comp:[-20,3,.004,.1],verb:{t:'plate',s:.3}},cym:{lvl:.5,hpf:350,verb:{t:'hall',s:.22}}},
 bal:{pad:-15,pad2:-19,keys:-16,pulse:-16,bass:-12.5,sub:-17,lead:-11},
 fx:{plate:2.2,hall:3.2,dly:{div:.75,fb:.42}},master:{air:3,side:1.16,tilt:.15,sat:.2,glue:[-18,2],loud:-12.5}},
house:{n:'House',d:'Piano-house chords, organ-style synth stabs, Juno and Jupiter pads, real TR-909 and TR-707, bouncing synth bass with a sub layer, shuffled hats, sidechain',bpm:[120,126],modes:{maj:2,min:2,dor:1},sw:0,sw16:.12,push:.45,color:'soul',prog:'soul',melody:'hook',kits:['tr909','tr707'],grooves:['house','house2','deephouse'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.48,fm:1,
 edm:{uni:{pad:3},wall:1,build:1,sweep:1,riser:0,sub:['sh2_ghost','j6_short'],dbl:['esq_bell','j6_pwpl'],ott:{keys:.25,pad:.25}},
 roles:{keys:{pat:['pianoHouse','offstab'],reg:[55,79],intro:1},pad:{pat:['pad'],reg:[52,76]},pulse:{pat:['offstab','pluck16'],reg:[60,84],enter:1},bass:{pat:['houseBass','offBass'],reg:[28,48]},lead:{reg:[62,88]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['grand','kawai'],pad:['j6_open','jx8_dark'],pulse:['jx_rave','esq_ep'],bass:['j6_pulse','mb_sharp'],lead:['jd_bright','vibes'],color:['esq_bell']},
  {keys:['jd_digi','esq_ep'],pad:['jp4_vikings','k3_gentle'],pulse:['j6_rich'],bass:['a4_blip','cp_pwbass'],lead:['sh2_simple','eguitar'],color:['a4_fm']},
  {keys:['k3_ep','wurli'],pad:['un_lush','hs_vs'],pulse:['jx_rave'],bass:['esq_bass','swagbass'],lead:['jd_orange'],color:['vibes']}],
 mix:{keys:{hpf:150,verb:{t:'plate',s:.24},dly:.1,comp:[-20,3,.005,.12]},pad:{lvl:.5,hpf:200,mod:{t:'chorus',d:.3},width:8},pulse:{dly:.25,verb:{t:'plate',s:.22}},bass:{sat:.2,comp:[-24,4,.005,.1]},kick:{eq:[['p',58,2.5,1],['p',380,-4,1.2]],sat:.15},drums:{lvl:.8},hat:{lvl:.62,hpf:450,eq:[['hs',8000,2.5]],verb:{t:'room',s:.08}},snare:{lvl:.85,hpf:150,eq:[['p',220,1.5,1],['p',5500,2.5,1]],comp:[-20,3,.004,.1],verb:{t:'plate',s:.3}},cym:{lvl:.5,hpf:350,verb:{t:'hall',s:.22}}},
 bal:{keys:-14,pad:-18,bass:-12.5,sub:-17.5},
 fx:{plate:2,dly:{div:.75,fb:.35}},master:{air:2.5,side:1.1,tilt:.1,sat:.17,loud:-13}},
deephouse:{n:'Deep House',d:'Dub chord stabs drowned in delay, warm Jupiter-4 and Juno pads, deep Roland SH-2 bass, TR-909 with shakers and rim, laid-back shuffle',bpm:[116,122],modes:{min:3,dor:2},sw:0,sw16:.18,push:.5,color:'jazz',prog:'soul',melody:'hook',kits:['tr909','tr707'],grooves:['deephouse','deephouse2'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.4,fm:1,
 edm:{uni:{pad:3},wall:0,build:0,sweep:1,riser:0,sub:['sh2_ghost','sh2_two'],dbl:['esq_bell'],ott:{keys:.2}},
 roles:{keys:{pat:['dubstab'],reg:[55,76],intro:1},pad:{pat:['pad'],reg:[50,74],intro:1},pulse:{pat:['pluck16'],reg:[62,84],enter:2,p:.6},bass:{pat:['houseBass','syncopated'],reg:[26,46]},lead:{reg:[60,86]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['jx_rave','k3_ep'],pad:['jp4_vikings','j6_open'],pulse:['j6_rich'],bass:['sh2_two','sh2_ghost'],lead:['esq_ep','vibes'],color:['esq_bell']},
  {keys:['esq_ep','wurli'],pad:['jx8_dark','esq_detune'],pulse:['jd_pluck'],bass:['mg1_moog','j6_short'],lead:['jd_orange'],color:['a4_fm']}],
 mix:{keys:{hpf:180,dly:.38,verb:{t:'hall',s:.4},mod:{t:'chorus',d:.2}},pad:{lvl:.48,hpf:220,width:8},bass:{sat:.15},hat:{lvl:.48},drums:{lvl:.75}},
 fx:{hall:3,dly:{div:.75,fb:.48}},master:{side:1.08,tilt:-.15,sat:.15,loud:-13.5}},
techno:{n:'Techno',d:'A hypnotic resonant Roland SH-2 acid line with slides and accents, TR-909 rumble, ride and offbeat hats, dark Analog Four and JX-8P drones, filter-swept builds',bpm:[124,132],modes:{min:3,dor:2},sw:0,sw16:.04,push:.45,color:'triad',prog:'modal',melody:'hook',kits:['tr909'],grooves:['techno','techno2'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.5,fm:1,
 edm:{uni:{pad:3},wall:1,build:1,sweep:1,riser:1,sub:['hs_plastic','sh2_ghost'],dbl:[],ott:{pulse:.3}},
 roles:{pulse:{pat:['acid16'],reg:[36,60]},pad:{pat:['pad'],reg:[48,72],intro:1},keys:{pat:['offstab'],reg:[55,76],p:.6},bass:{pat:['roll16'],reg:[24,40]},color:{pat:['sparkle'],reg:[72,96]},lead:{reg:[60,84],p:.5}},
 bands:[{pulse:['sh2_rezsaw','sh2_rezsq'],pad:['a4_gritpad','jx8_dark'],keys:['jx_rave'],bass:['hs_plastic','k3_solid'],color:['a4_fm'],lead:['sh2_simple']},
  {pulse:['sh2_rezsq','sh2_rezsaw'],pad:['esq_detune','z1_string'],keys:['xp_sawpl'],bass:['un_mgbass','jx_snap'],color:['esq_bell'],lead:['xp_phase']}],
 mix:{pulse:{lvl:.75,hpf:120,dly:.22,verb:{t:'plate',s:.2},sat:.25,pan:.18},pad:{lvl:.42,hpf:250,verb:{t:'hall',s:.55},width:10},bass:{sat:.3,lpf:900},kick:{eq:[['p',50,3,1],['p',400,-5,1.2]],sat:.25,verb:{t:'hall',s:.08}},drums:{lvl:.85},hat:{lvl:.62,hpf:450,eq:[['hs',8000,2.5]],verb:{t:'room',s:.08}},snare:{lvl:.85,hpf:150,eq:[['p',220,1.5,1],['p',5500,2.5,1]],comp:[-20,3,.004,.1],verb:{t:'plate',s:.3}},cym:{lvl:.5,hpf:350,verb:{t:'hall',s:.22}}},
 bal:{pulse:-15,pad:-20},
 fx:{hall:3.6,dly:{div:.75,fb:.45}},master:{air:2.5,side:1.05,tilt:-.1,sat:.22,loud:-12.5}},
trance:{n:'Trance',d:'Trance-gated unison supersaw chords, Juno and JD-800 plucks in sixteenths, rolling offbeat bass, a soaring Jupiter-4 or JD-800 lead, long risers and snare-roll builds into the drop',bpm:[132,140],modes:{min:4,maj:1},sw:0,push:.4,color:'pop',prog:'epic',melody:'hook',kits:['tr909'],grooves:['trance','trance2'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.55,fm:1,
 edm:{uni:{pad:5,lead:5,pad2:3},wall:1,build:1,sweep:1,riser:1,sub:['hs_plastic','j6_short'],dbl:['a4_fm','j6_pwpl'],ott:{pad:.4,pulse:.35,lead:.3}},
 roles:{pad:{pat:['gate16','saw'],reg:[50,79],intro:1},pad2:{pat:['pad'],reg:[55,84],intro:1},pulse:{pat:['pluck16'],reg:[62,88],enter:1},bass:{pat:['roll16','offBass'],reg:[28,46]},lead:{reg:[64,92]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{pad:['s100_saw4','cp_bigbad'],pad2:['un_lush','jp4_pwm'],pulse:['jd_pluck','j6_pwpl'],bass:['j6_pulse','mb_sharp'],lead:['jp4_bold','jd_bright'],color:['a4_fm']},
  {pad:['xp_bigstack','aj_chsaw'],pad2:['jx_strings','cp_pwmstack'],pulse:['z1_plucky','j6_rich'],bass:['a4_blip'],lead:['jd_orange','cp_wow'],color:['esq_bell']}],
 mix:{pad:{lvl:.6,hpf:200,mod:{t:'chorus',d:.32},width:10,verb:{t:'hall',s:.45}},pad2:{lvl:.4,hpf:300,width:12,verb:{t:'hall',s:.55}},pulse:{hpf:280,dly:.32,verb:{t:'hall',s:.3},width:4},lead:{dly:.26,verb:{t:'hall',s:.42}},bass:{sat:.2},kick:{eq:[['p',55,3,1],['p',380,-4,1.2]],sat:.15},drums:{lvl:.8},hat:{lvl:.62,hpf:450,eq:[['hs',8000,2.5]],verb:{t:'room',s:.08}},snare:{lvl:.85,hpf:150,eq:[['p',220,1.5,1],['p',5500,2.5,1]],comp:[-20,3,.004,.1],verb:{t:'plate',s:.3}},cym:{lvl:.5,hpf:350,verb:{t:'hall',s:.22}}},
 bal:{pad:-15,pad2:-19,pulse:-15,lead:-11},
 fx:{hall:3.6,dly:{div:.75,fb:.45}},master:{air:3,side:1.16,tilt:.2,sat:.18,loud:-12.5}},
synthwave:{n:'Synthwave',d:'Retro-80s Jupiter-4 and JX-3P brass and strings, Juno arpeggios, octave synth bass, LinnDrum, DMX and TR-707 with gated-reverb snare, chorus everywhere, a little tape wow',bpm:[84,108],modes:{min:3,maj:2},sw:0,push:.35,color:'pop',prog:'pop',melody:'hook',kits:['linn9k','dmx','tr707'],grooves:['synthwave','synthwave2'],drumP:1,under:'full',fill:1,arc:1,drumEnter:1,pump:.25,fm:1,
 edm:{uni:{pad:3,lead:3},wall:1,build:0,sweep:0,riser:0,sub:[],dbl:['a4_fm'],ott:{pad:.2}},
 roles:{keys:{pat:['block','stab'],reg:[52,76],intro:1},pad:{pat:['pad'],reg:[50,76],intro:1},pulse:{pat:['arp16'],reg:[60,84],enter:1},bass:{pat:['octave8','eighths'],reg:[28,50]},lead:{reg:[60,88]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['jp4_brass','jx_big'],pad:['jp4_pwm','jx_strings'],pulse:['j6_pwpl','j6_rich'],bass:['jx_snap','jx_rounder'],lead:['jp4_lead','jd_orange'],color:['a4_fm']},
  {keys:['jx_piano','jp4_piano'],pad:['j6_open','jx8_dark'],pulse:['jd_pluck'],bass:['j6_pulse','mg1_moog'],lead:['jp4_bold','s100_lead'],color:['esq_bell']},
  {keys:['esq_ep','fmpiano'],pad:['cp_hollow','z1_string'],pulse:['fmclav','j6_pwpl'],bass:['k3_solid','jx_snap'],lead:['sh2_simple','cp_wow'],color:['a4_fm']}],
 mix:{keys:{mod:{t:'chorus',d:.32},width:6,verb:{t:'hall',s:.3}},pad:{lvl:.52,mod:{t:'chorus',d:.35},width:10,verb:{t:'hall',s:.5}},pulse:{dly:.3,pan:.3,mod:{t:'chorus',d:.25}},lead:{dly:.24,verb:{t:'hall',s:.4},mod:{t:'chorus',d:.18}},bass:{sat:.18},snare:{verb:{t:'gated',s:.55},eq:[['p',220,2,1],['p',5000,2.5,1]]},tom:{verb:{t:'gated',s:.4}},drums:{lvl:.72}},
 fx:{hall:3.4,gated:.42,dly:{div:.75,fb:.38}},master:{side:1.12,tilt:.1,sat:.18,wow:.35,loud:-13}},
futurebass:{n:'Future Bass',d:'Chopped unison supersaw chords that pump hard, wobbling Kawai K3 and MG-1 bass, JD-800 and Z1 plucks, FM bells, TR-808 rolls and SP-12 snare, half-time drops',bpm:[140,156],modes:{maj:3,min:2},sw:0,push:.4,color:'jazz',prog:'pop',melody:'hook',kits:['tr808','sp12'],grooves:['futurebass','futurebass2'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.72,fm:1,
 edm:{uni:{keys:5,pad:3},wall:1,build:1,sweep:1,riser:1,sub:['sub808'],dbl:['a4_fm','esq_bell'],ott:{keys:.45,pad:.35,pulse:.3},wob:{depth:800,base:900}},
 roles:{keys:{pat:['chordChop'],reg:[55,81]},pad:{pat:['pad'],reg:[52,79],intro:1},pulse:{pat:['pluck16','arp16'],reg:[62,88],enter:1},bass:{pat:['wobBass'],reg:[26,46]},lead:{reg:[64,92]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['cp_bigbad','s100_saw4'],pad:['un_lush','cp_pwmstack'],pulse:['jd_pluck','z1_plucky'],bass:['k3_wobble','mg1_wob'],lead:['jd_bright','cp_wow'],color:['a4_fm']},
  {keys:['xp_bigstack','jx_big'],pad:['j6_new','jp4_unison'],pulse:['j6_rich'],bass:['mg1_wob','k3_wobble'],lead:['jd_orange'],color:['esq_bell']}],
 mix:{keys:{lvl:.85,hpf:220,mod:{t:'chorus',d:.3},width:10,verb:{t:'hall',s:.35},sat:.12},pad:{lvl:.42,hpf:260,width:10},pulse:{dly:.3,verb:{t:'plate',s:.3}},bass:{sat:.35,lpf:7000},drums:{lvl:.8},hat:{lvl:.62,hpf:450,eq:[['hs',8000,2.5]],verb:{t:'room',s:.08}},snare:{lvl:.85,hpf:150,eq:[['p',220,1.5,1],['p',5500,2.5,1]],comp:[-20,3,.004,.1],verb:{t:'plate',s:.3}},cym:{lvl:.5,hpf:350,verb:{t:'hall',s:.22}}},
 bal:{keys:-13,pad:-19,bass:-12.5,sub:-16},
 fx:{hall:2.8,dly:{div:.75,fb:.38}},master:{air:3,side:1.15,tilt:.25,sat:.2,glue:[-18,2],loud:-12.5}},
dnb:{n:'Liquid Drum & Bass',d:'Fast two-step breaks on an E-mu SP-12 and TR-909, a deep reese with a sub layer, ESQ-1 and K3 electric pianos, lush UltraNova and Jupiter pads',bpm:[168,176],modes:{min:3,maj:1,dor:1},sw:0,push:.4,color:'jazz',prog:'soul',melody:'hook',kits:['sp12','tr909'],grooves:['dnb','dnb2'],drumP:1,under:'full',fill:1,arc:1,drumEnter:1,pump:.3,fm:1,
 edm:{uni:{pad:3},wall:1,build:1,sweep:1,riser:1,sub:['hs_plastic','sh2_ghost'],dbl:['esq_bell'],ott:{pad:.2}},
 roles:{keys:{pat:['sparse','block'],reg:[52,76],intro:1},pad:{pat:['pad'],reg:[52,76],intro:1},pulse:{pat:['arp8'],reg:[62,86],enter:1,p:.7},bass:{pat:['reese','dnbBass'],reg:[26,45]},lead:{reg:[62,88]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['esq_ep','k3_ep'],pad:['un_lush','jp4_vikings'],pulse:['j6_rich'],bass:['a4_blip','esq_bass'],lead:['jd_orange','vibes'],color:['esq_bell']},
  {keys:['wurli','jd_digi'],pad:['cp_hollow','z1_string'],pulse:['jd_pluck'],bass:['un_mgbass','z1_brassbass'],lead:['sh2_simple','eguitar'],color:['a4_fm']}],
 mix:{keys:{verb:{t:'hall',s:.35},mod:{t:'chorus',d:.2}},pad:{lvl:.5,width:10,verb:{t:'hall',s:.5}},bass:{sat:.3,lpf:3000},drums:{lvl:.78},hat:{lvl:.62,hpf:450,eq:[['hs',8000,2.5]],verb:{t:'room',s:.08}},snare:{lvl:.85,hpf:150,eq:[['p',220,1.5,1],['p',5500,2.5,1]],comp:[-20,3,.004,.1],verb:{t:'plate',s:.3}},cym:{lvl:.5,hpf:350,verb:{t:'hall',s:.22}}},
 fx:{hall:3.4,dly:{div:.75,fb:.35}},master:{air:2.5,side:1.1,sat:.18,loud:-13}},
downtempo:{n:'Chillout',d:'Downtempo: Kawai K3 and ESQ-1 electric pianos, slow Juno and JX-8P pads, warm Moog-built bass, SP-12 and CR-78 beats with a lazy swing',bpm:[84,100],modes:{maj:2,min:2,dor:1},sw:.28,push:.4,color:'jazz',prog:'soul',melody:'hook',kits:['sp12','cr78'],grooves:['downtempo','downtempo2'],drumP:1,under:'full',fill:0,arc:1,drumEnter:1,pump:.18,fm:1,
 edm:{uni:{pad:3},wall:0,build:0,sweep:1,riser:0,sub:[],dbl:['esq_bell'],ott:{}},
 roles:{keys:{pat:['rootless','sparse'],reg:[52,76],intro:1},pad:{pat:['pad'],reg:[50,74],intro:1},pulse:{pat:['arp8','pluckPulse'],reg:[60,84],enter:1,p:.7},bass:{pat:['syncopated','lofiBass'],reg:[28,48]},lead:{reg:[60,86]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['k3_ep','esq_ep'],pad:['jx8_dark','j6_open'],pulse:['j6_rich','kalimba'],bass:['mg1_moog','cp_pwbass'],lead:['vibes','jd_orange'],color:['esq_bell']},
  {keys:['wurli','jp4_piano'],pad:['k3_gentle','hs_vs'],pulse:['jd_pluck'],bass:['s100_bass','jazzbass'],lead:['sh2_simple','nylon'],color:['a4_fm']}],
 mix:{keys:{verb:{t:'plate',s:.3},mod:{t:'trem',r:4.5,d:.2}},pad:{lvl:.5,width:8,verb:{t:'hall',s:.5}},pulse:{dly:.28},bass:{sat:.15},drums:{lvl:.68}},
 fx:{plate:2.4,hall:3.2,dly:{div:.75,fb:.35}},master:{side:1.05,tilt:-.2,sat:.14,wow:.25,loud:-14}},
campfire:{n:'Campfire Pop',d:'Strummed steel-string guitars, claps and stomps, glockenspiel hooks',bpm:[92,108],modes:{maj:6,min:1},sw:0,push:.35,color:'bright',prog:'folk',melody:'hook',kits:['hand','studio'],alias:{k:'k'},grooves:['stomp','stomp2'],drumP:1,under:'full',fill:0,arc:1,drumEnter:2,
 roles:{keys:{pat:['strum16'],reg:[40,71],guitar:1,intro:1},pulse:{pat:['strum16'],reg:[47,76],guitar:1,enter:4},bass:{pat:['rootFive','octave8'],reg:[28,50],enter:1},riff:{pat:['riff'],reg:[67,91],enter:2},lead:{reg:[64,90]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['steel'],pulse:['nylon'],bass:['jazzbass','dbpizz'],riff:['glock','xylo'],lead:['recorder','glock'],color:['glock']},
  {keys:['steel'],pulse:['strumstick'],bass:['swagbass','dbpizz'],riff:['glock','marimba'],lead:['ocarina','violin']},
  {keys:['nylon'],pulse:['steel'],bass:['jazzbass'],riff:['xylo','kalimba'],lead:['harmonica','recorder'],color:['glock']}],
 mix:{keys:{pan:-.34,verb:{t:'room',s:.16},comp:[-22,2.5,.01,.15],eq:[['p',220,-2,1],['hs',7000,2]]},pulse:{pan:.38,verb:{t:'room',s:.18},eq:[['p',220,-3,1]]},riff:{verb:{t:'plate',s:.24},dly:.14},bass:{eq:[['p',90,2.5,1]]},drums:{lvl:.72},snare:{verb:{t:'room',s:.25}}},
 fx:{room:1.1},master:{side:.95,tilt:-.25,loud:-14}},
epic:{n:'Epic Drive',d:'Driving string ostinatos, piano octaves, big drums and brass, with stops',bpm:[118,136],modes:{min:5,maj:1},sw:0,push:.2,color:'cine',prog:'epic',melody:'lyric',kits:['orch','studio'],grooves:['epic','epic2'],drumP:1,under:'full',fill:1,arc:1,stop:1,drumEnter:2,
 roles:{pulse:{pat:['spiccato'],reg:[50,74],intro:1},keys:{pat:['pianoOct'],reg:[36,64],enter:1},pad:{pat:['pad'],reg:[48,72],enter:2},bass:{pat:['octave8','whole'],reg:[26,48]},lead:{reg:[55,82]},counter:{pat:['hornStab'],reg:[45,70],enter:4},color:{pat:['sparkle'],reg:[72,96]}},
 bands:[{pulse:['strings'],keys:['grand','steinway'],pad:['strings'],bass:['contrabass','dbarco'],lead:['horn','trumpet'],counter:['trombone','horn'],color:['tubular','chimes']},
  {pulse:['strings','pizz'],keys:['steinway'],pad:['strings'],bass:['contrabass','tuba'],lead:['cello','horn'],counter:['trombone'],color:['glock']},
  {pulse:['pizz'],keys:['grand'],pad:['strings'],bass:['dbarco','bassvi'],lead:['trumpet','horn'],counter:['tuba','trombone']}],
 mix:{pulse:{pan:-.3,verb:{t:'hall',s:.28}},keys:{verb:{t:'hall',s:.25}},pad:{verb:{t:'hall',s:.45},width:6},lead:{verb:{t:'hall',s:.38}},counter:{verb:{t:'hall',s:.32}},kick:{eq:[['p',60,3,1]],verb:{t:'hall',s:.22}},snare:{verb:{t:'hall',s:.35}},tom:{lvl:.85,verb:{t:'hall',s:.3}},drums:{lvl:.8}},
 fx:{hall:3.2},master:{side:1.05,tilt:0,sat:.14,loud:-13.5}},
anthem:{n:'Uplifting Build',d:'Piano chords that grow into a full band: eighth-note bass, four-on-the-floor lift',bpm:[72,82],modes:{maj:6,min:1},sw:0,push:.3,color:'bright',prog:'anthem',melody:'lyric',kits:['studio','pi'],grooves:['anthem'],drumP:1,under:'light',fill:1,arc:1,
 roles:{keys:{pat:['halfChords'],reg:[50,76],intro:1},pulse:{pat:['keys8'],reg:[52,76],enter:2},bass:{pat:['octave8'],reg:[28,50],enter:1},pad:{pat:['pad'],reg:[50,74],enter:2},riff:{pat:['riff'],reg:[67,91],enter:4},lead:{reg:[60,86]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['grand','kawai'],pulse:['eguitar'],bass:['jazzbass','swagbass'],pad:['strings'],riff:['glock'],lead:['violin','flute'],color:['glock']},
  {keys:['steinway','felt'],pulse:['grand'],bass:['swagbass'],pad:['strings'],riff:['xylo','glock'],lead:['horn','cello']},
  {keys:['kawai'],pulse:['cp80','eguitar'],bass:['bassvi','jazzbass'],pad:['strings'],riff:['vibes'],lead:['violin']}],
 mix:{keys:{verb:{t:'hall',s:.26}},pulse:{pan:.32,verb:{t:'room',s:.2},dly:.1},pad:{verb:{t:'hall',s:.4}},riff:{verb:{t:'plate',s:.26},dly:.16},drums:{lvl:.72}},
 fx:{hall:2.8,dly:{div:.75,fb:.3}},master:{side:1,tilt:-.1,loud:-14}},
drivepop:{n:'Upbeat Pop',d:'Punchy kick and claps, pumping bass, piano and plucked hooks',bpm:[96,106],modes:{maj:5,min:2},sw:0,push:.45,color:'pop',prog:'pop',melody:'hook',kits:['studio','tr808'],grooves:['drive','drive2'],drumP:1,under:'full',fill:1,arc:1,
 roles:{keys:{pat:['keys8'],reg:[52,76],intro:1},pulse:{pat:['arp16','pluckPulse'],reg:[60,84],enter:2},bass:{pat:['octave8','pulse8'],reg:[28,50]},riff:{pat:['riff'],reg:[64,88],enter:2},lead:{reg:[62,88]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['grand','kawai'],pulse:['marimba','kalimba'],bass:['bassvi','swagbass'],riff:['glock','xylo'],lead:['eguitar','flute'],color:['glock']},
  {keys:['cp80','wurli'],pulse:['eguitar'],bass:['swagbass','jazzbass'],riff:['marimba'],lead:['saxello','violin']},
  {keys:['steinway'],pulse:['fmclav','kalimba'],bass:['bassvi'],riff:['vibeshard','glock'],lead:['eguitar']}],
 mix:{keys:{pan:-.28,comp:[-22,3,.01,.12],verb:{t:'room',s:.18}},pulse:{pan:.36,dly:.14},bass:{sat:.25,comp:[-24,4,.005,.08],eq:[['p',60,3,1]]},kick:{eq:[['p',55,3.5,1],['p',350,-4,1]],sat:.2},snare:{verb:{t:'plate',s:.25}},drums:{lvl:.8}},
 fx:{plate:1.8,dly:{div:.75,fb:.3}},master:{side:.95,tilt:-.1,sat:.15,loud:-13}},
brooklyn:{n:'Indie Keys',d:'Pulsing piano eighths, warm bass, busy brushed-up kit, vibes',bpm:[98,110],modes:{maj:3,min:2},sw:.02,push:.4,color:'pop',prog:'pop',melody:'hook',kits:['pi','studio'],grooves:['busy','busy2'],drumP:1,under:'full',fill:1,arc:1,drumEnter:1,
 roles:{keys:{pat:['keys8'],reg:[50,76],intro:1},pulse:{pat:['arp8'],reg:[55,79],enter:2},bass:{pat:['eighths','octave8'],reg:[28,50]},riff:{pat:['riff'],reg:[62,86],enter:2},lead:{reg:[60,86]},color:{pat:['sparkle'],reg:[76,100]}},
 bands:[{keys:['yamaha_up','knight'],pulse:['eguitar'],bass:['jazzbass','dbpizz'],riff:['vibes','glock'],lead:['eguitar','flute']},
  {keys:['grand','kawai'],pulse:['marimba'],bass:['swagbass'],riff:['glock'],lead:['violin','recorder']},
  {keys:['knight','felt'],pulse:['eguitar'],bass:['jazzbass'],riff:['vibeshard'],lead:['saxello']}],
 mix:{keys:{pan:-.2,comp:[-22,2.5,.01,.15],verb:{t:'room',s:.2},eq:[['p',250,-2,1]]},pulse:{pan:.36,mod:{t:'chorus',d:.2}},bass:{eq:[['p',100,2,1]],sat:.15},hat:{lvl:.42},drums:{lvl:.7}},
 fx:{room:1},master:{side:.95,tilt:-.15,loud:-14}},
};
const GROOVES={
 calypso:{k:'o.......o.......',cgh:'..x..x.x..x..x.x',cgl:'o.....o.o.....o.',sh:'xxxxxxxxxxxxxxxx',cb:'x..x..x...x.x...'},calypso2:{k:'o...o...o...o...',cgh:'..x...x...x.x.x.',sh:'x.xxx.xxx.xxx.xx',tb:'....x.......x...'},
 mbira:{fd:'o.....o...o.....',fdm:'...x.....x....x.',sh:'x.xxx.xxx.xxx.xx',ag:'x..x..x...x..x..'},mbira2:{dkd:'o.......o..o....',dkt:'..x.x.....x.x.x.',sh:'x.xxx.xxx.xxx.xx'},
 marimbag:{cgl:'o.......o.......',cgh:'....x.......x..x',sh:'x.x.x.x.x.x.x.x.',wb:'..x...x...x...x.'},
 zen:{sdl:'o.........o.....',sdh:'......x.......x.',tri:'x...............'},zen2:{fd:'o...............',sdh:'........x.......',chm:'............x...'},
 nordic:{fd:'o.......o.......',fdm:'....x.......x...'},nordic2:{fd:'o..o....o..o....',fdm:'......x.......x.'},
 celtic:{fd:'o..o..o..o..o.o.',fdm:'.x..x..x..x..x..'},celtic2:{fd:'o.....o...o.....',fdm:'..x.x...x...x.x.',sh:'x.x.x.x.x.x.x.x.'},
 bluegrass:{k:'o.......o.......',s:'....o.......o...',sh:'x.x.x.x.x.x.x.x.'},
 reggae:{k:'........o.......',ss:'........x.......',h:'x.x.x.x.x.x.x.x.'},reggae2:{k:'o...o...o...o...',ss:'........x.......',h:'..x...x...x...x.'},reggae3:{k:'........o.......',s:'........o.......',h:'xxx.xxx.xxx.xxx.',oh:'..............x.'},
 meditation:{nbell:'o...............',chm:'........x.......'},meditation2:{sdl:'o...............',nbell:'........o.......'},
 bb2:{k:'o..x....o.......',s:'....o.......o...',h:'xxxxxxxxxxxxxxxx'},bb3:{k:'o.....x.o.......',s:'....o.......o..g',h:'x.x.x.x.x.x.x.xx',oh:'..............x.'},bb4:{k:'o..x..x...x.....',s:'....o.......o...',h:'x.xxx.xxx.xxx.xx'},
 bb5:{k:'o.....x...x.....',s:'........o.......',h:'x.x.x.x.x.x.x.x.'},bb7:{k:'o.........o..x..',s:'....o..g.g..o...',h:'x.x.x.x.x.x.x.x.'},bb8:{k:'o.......o.......',s:'....o.......o...',t3:'..x...x...x...x.',sh:'x.x.x.x.x.x.x.x.'},
 bb9:{k:'o..x...xo.......',ss:'....x.......x...',h:'x.x.x.x.x.x.x.x.',sh:'xxxxxxxxxxxxxxxx'},bb10:{k:'o.......o..x....',s:'....o.......o...',rd:'x.x.x.x.x.x.x.x.'},bb11:{k:'o...o...o...o...',s:'....o.......o...',tb:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},
 bb12:{k:'o.....o.....o...',s:'....o.......o...',h:'x.xx.xx.xx.xx.x.'},bb13:{k:'o..o..o...o.....',s:'....o.......o...',h:'..x...x...x...x.',cb:'x...x...x...x...'},
 ff1:{k:'o...o...o...o...',cl:'....o.......o...',h:'..x...x...x...x.'},ff2:{k:'o...o...o...o...',s:'....o.......o...',h:'xxxxxxxxxxxxxxxx',oh:'..x...x...x...x.'},ff3:{k:'o...o...o...o..x',cl:'....o.......o...',sh:'x.xxx.xxx.xxx.xx',rd:'..x...x...x...x.'},
 ff4:{k:'o...o...o...o...',cl:'....o..x....o...',h:'.xx..xx..xx..xx.'},ff5:{k:'o..xo...o..xo...',cl:'....o.......o...',oh:'..x...x...x...x.',h:'x...x...x...x...'},ff6:{k:'o...o...o...o...',ss:'..x..x....x..x..',h:'..x...x...x...x.',cgh:'...x......x.....'},
 br1:{k:'o.....o...o.....',s:'....o.......o...',h:'x.xxx.x.x.xxx.x.'},br2:{k:'o......o..o.....',s:'....o.......o..g',h:'x.x.x.x.x.x.x.x.'},br3:{k:'o.......o..o....',s:'........o.......',h:'x.x.x.xxx.x.xxxx'},br4:{k:'o..o......o.....',s:'....o.......o...',h:'x..x..x..x..x.x.',cb:'..x.....x.......'},
 edm:{k:'o...o...o...o...',cl:'....o.......o...',oh:'..x...x...x...x.',h:'x.xxx.xxx.xxx.xx'},edm2:{k:'o...o...o...o...',cl:'....o.......o...',s:'....x.......x...',oh:'..x...x...x...x.',h:'xxxxxxxxxxxxxxxx',sh:'..x...x...x...x.'},
 bigroom:{k:'o...o...o...o...',cl:'....o.......o...',s:'....o.......o...',oh:'..o...o...o...o.',rd:'x.x.x.x.x.x.x.x.'},
 deephouse:{k:'o...o...o...o...',cl:'....x.......x...',h:'..x...x...x...x.',sh:'x.xxx.xxx.xxx.xx',ss:'.......x.....x..'},deephouse2:{k:'o...o...o...o...',cl:'....x.......x...',oh:'..x...x...x...x.',sh:'xxxxxxxxxxxxxxxx',ss:'...x......x.....'},
 techno:{k:'o...o...o...o...',h:'x.x.x.x.x.x.x.x.',oh:'..x...x...x...x.',rd:'..x...x...x...x.',cl:'....x.......x...'},techno2:{k:'o...o...o...o...',h:'xxxxxxxxxxxxxxxx',oh:'..x...x...x...x.',ss:'..........x...x.',cl:'....x...........'},
 trance:{k:'o...o...o...o...',cl:'....o.......o...',oh:'..x...x...x...x.',h:'xxxxxxxxxxxxxxxx'},trance2:{k:'o...o...o...o...',cl:'....o.......o...',oh:'..o...o...o...o.',h:'x.xxx.xxx.xxx.xx',rd:'x.x.x.x.x.x.x.x.'},
 synthwave:{k:'o.......o.......',s:'....o.......o...',h:'x.x.x.x.x.x.x.x.'},synthwave2:{k:'o...o...o...o...',s:'....o.......o...',h:'xxxxxxxxxxxxxxxx',oh:'..............x.'},
 futurebass:{k:'o......o..o.....',s:'........o.......',cl:'........o.......',h:'x.x.x.x.x.x.xxx.x.x.x.x.xx.xxxxx'},futurebass2:{k:'o.........o.o...',s:'........o.......',h:'x.xxx.x.x.xxx.x.',oh:'..............x.'},
 dnb:{k:'o.........o.....',s:'....o.......o...',h:'x.x.x.x.x.x.x.x.',sh:'xxxxxxxxxxxxxxxx'},dnb2:{k:'o.........o.....o.o.......o.....',s:'....o.......o.......o..g....o...',h:'x.x.x.x.x.x.x.x.',rd:'..x...x...x...x.'},
 downtempo:{k:'o......o..o.....',s:'....o.......o...',h:'x.x.x.x.x.x.x.x.',sh:'..x...x...x...x.'},downtempo2:{k:'o.......o..x....',s:'....o.......o..g',h:'x.xx.x.xx.x.x.xx',ss:'..........x.....'},
 pop8:{k:'o.......o.x.....',s:'....o.......o...',h:'x.x.x.x.x.x.x.x.'},halftime:{k:'o.........x.....',s:'........o.......',h:'x.x.x.x.x.x.x.x.'},
 fourfloor:{k:'o...o...o...o...',cl:'....x.......x...',h:'..x...x...x...x.',sh:'xxxxxxxxxxxxxxxx'},synth:{k:'o.......o.o.....',s:'....o.......o...',cl:'....x.......x...',h:'x.x.x.x.x.x.x.x.',oh:'..............x.'},
 lofi:{k:'o.....x...x.....',s:'....o.......o..g',h:'x.x.x.x.x.x.x.x.'},lofi2:{k:'o.......o..x....',s:'....o.......o...',h:'x.xx.x.xx.x.x.xx'},
 swing:{rd:'x...x.x.x...x.x.',hp:'....x.......x...',k:'g.......g.......',s:'.......g.....g..'},brush:{ss:'....x.......x...',k:'g.......g.......',sh:'x.x.x.x.x.x.x.x.',hp:'....x.......x...'},
 folk:{k:'o.....o...o.....',s:'....o.......o...',sh:'x.x.x.x.x.x.x.x.',tb:'............x...'},folk2:{k:'o.......o.......',s:'....o.......o...',sh:'xxxxxxxxxxxxxxxx'},
 gospel:{k:'o.......o..x....',s:'....o.......o...',h:'x.x.x.x.x.x.x.x.',tb:'....x.......x...'},bossa:{k:'o..x....o..x....',ss:'x..x..x...x..x..',sh:'xxxxxxxxxxxxxxxx'},
 world:{cgl:'o.....x...o.....',cgh:'..x.x...x..x.x..',bh:'.x...x.x.x...x.x',sh:'xxxxxxxxxxxxxxxx',cab:'x.x.x.x.x.x.x.x.'},
 darbuka:{dkd:'o.....o...o.....',dkt:'..x.x...x.x..x.x',fd:'o.......o.......',sh:'x.x.x.x.x.x.x.x.'},tabla:{ge:'o.....x...o.....',na:'..x.x...x.x.x.x.',te:'.x.....x.....x..',sh:'x.x.x.x.x.x.x.x.'},
 cine:{k:'o.......g.......',t1:'..........x.....'},
 funk:{k:'o..x..o...x..o..o..x..o.o.....x.',s:'....o..g.g..o..g....o..g.g..o.gg',h:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',oh:'..............x...............x.'},
 funk2:{k:'o.x...o..x..o...o.x...o..x.x..o.',s:'....o.g....go...g...o.g....go.g.',h:'x.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xx',tb:'........x...............x.......'},
 stomp:{k:'o.......o..x....o.......o..x..x.',cl:'....o.......o.......o.......o...',sh:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',tb:'..x...x...x...x...x...x...x...x.'},
 stomp2:{k:'o.....o.o.......o.....o.o...o...',cl:'....o.......o.......o.......o.o.',sh:'x.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xx'},
 epic:{kf:'o.....o...o.....o.....o...o..o.o',t1:'..x.x...x..x.x.x..x.x...x..x.xxx',s:'....o.......o.......o.......o...',h:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.'},
 epic2:{kf:'o..o..o...o.o...o..o..o...o.o.o.',t1:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.xxxx',s:'........o...............o...o.o.'},
 anthem:{k:'o...o...o...o...o...o...o...o...',s:'....o.......o.......o.......o...',h:'..x...x...x...x...x...x...x...x.',sh:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'},
 drive:{k:'o..x..x...o..x..o..x..x...o.....',cl:'....o.......o.......o.......o...',s:'....x.......x.......x.......x..g',h:'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',oh:'......x.......x.......x.......x.'},
 drive2:{k:'o...o...o...o...o...o...o..xo...',cl:'....o.......o.......o.......o...',h:'..x...x...x...x...x...x...x.x.x.',sh:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'},
 busy:{k:'o..x....o.x..x..o..x....o.x.....',s:'....o..g....o.g.....o..g....o.gg',h:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',oh:'..............x...............x.'},
 house:{k:'o...o...o...o...o...o...o...o...',cl:'....o.......o.......o.......o...',oh:'..x...x...x...x...x...x...x...x.',h:'x.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xx'},
 house2:{k:'o...o...o...o...o...o...o..xo...',s:'....o.......o.......o.......o..g',h:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',oh:'..x.......x.......x.......x.....',cb:'...........x...............x....'},
 busy2:{k:'o.....x.o..x....o.....x.o..x..x.',s:'....o.......o..g....o.......o.g.',h:'x.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xx',tb:'....x.......x.......x.......x...'}};
const GROUP={sdl:'kick',sdh:'perc',gong:'cym',nbell:'perc',k:'kick',kf:'kick',kh:'kick',ks:'kick',k2:'kick',cj:'kick',ge:'kick',dkd:'kick',fd:'kick',s:'snare',ss:'snare',s2:'snare',sr:'snare',cl:'snare',cjs:'snare',dkt:'snare',na:'snare',
 up:'fx',down:'fx',rev:'fx',imp:'fx',hit:'fx',drop:'fx',swoosh:'fx',roll:'fx',splash:'fx',gu:'perc',
 h:'hat',hc:'hat',oh:'hat',hp:'hat',sh:'hat',sh2:'hat',cab:'hat',tbs:'hat',te:'hat',cr:'cym',cr2:'cym',rd:'cym',bell:'cym',swell:'cym',chm:'cym',t1:'tom',t2:'tom',t3:'tom',t4:'tom',t5:'tom',t6:'tom'};
const DPAN={h:.32,oh:.32,hp:.3,rd:-.32,bell:-.32,cr:-.28,cr2:.34,tb:.42,sh:-.4,cab:.38,cgh:.25,cgl:-.2,cgm:.1,bh:.35,bl:.2,t1:.3,t2:.18,t3:.06,t4:-.08,t5:-.2,t6:-.32,dkt:.2,dkd:-.1,fd:-.15,na:.18,te:.25,ge:-.12,cj:0,cjs:.05,clv:.3,cb:-.3,ag:.35};
const ADJ='Copper Harbor Cedar Lamplit Northbound Slate Overcast Juniper Saltmarsh Tidal Paper Amber Granite Prairie Signal Riverstone Foghorn Birch Meridian Lowland Quarry Kestrel Ember Ferry Lantern Orchard Basalt Sparrow Willow Timber Indigo Mesa Driftless Hollow Larkspur Cobalt'.split(' ');

/* ---------- voice analysis ---------- */
function analyze(env,parts,buf,hop=.025){const len=parts.reduce((n,p)=>n+p.end-p.start,0),vAt=t=>{if(t<0)return-1;for(const p of parts){const l=p.end-p.start;if(t<l)return p.start+t;t-=l}return-1},e=t=>{const v=vAt(t);return v<0?0:env[v/hop|0]||0},d=buf.getChannelData(0),sr=buf.sampleRate,pauses=[],ph=[],ev=[];let on=0,last=-9,prev=0,sum=0,n=0,run=0,k=0;
 const fstep=Math.max(2,Math.ceil(len/hop/420));
 for(let t=0;t<len;t+=hop,k++){const v=e(t);ev.push(v);sum+=v;n++;if(v>.35&&prev<=.35&&t-last>.09){on++;last=t}prev=v;if(v<.08)run+=hop;else{if(run>=.28&&t-run>.15)pauses.push({t:t-run,d:run});run=0}
  if(v>.3&&k%fstep==0){const f=pitch(d,Math.floor(vAt(t)*sr),sr);if(f>70&&f<700)ph.push([t,69+12*Math.log2(f/440),v])}}
 // octave-error cleanup: fold each frame toward the running median
 const ms=ph.map(x=>x[1]).sort((a,b)=>a-b),med=ms.length?ms[ms.length>>1]:52;for(const x of ph){while(x[1]-med>9)x[1]-=12;while(med-x[1]>9)x[1]+=12}
 // the voice's tuning against A440 (circular mean of the fractional semitone)
 let cx=0,cy=0;for(const[,m,w]of ph){const a=2*Math.PI*(m-Math.round(m));cx+=w*Math.cos(a);cy+=w*Math.sin(a)}const cents=ph.length?clamp(Math.atan2(cy,cx)/(2*Math.PI)*100,-45,45):0;
 // pitch-class profile: which notes the voice keeps landing on
 const hist=new Array(12).fill(0);for(const[,m,w]of ph){const r=m-cents/100,q=Math.round(r),c=1-Math.min(1,Math.abs(r-q)*2.2);hist[mod(q,12)]+=w*(.35+c)}
 const ss=ph.map(x=>x[1]).sort((a,b)=>a-b),pct=q=>ss.length?ss[Math.min(ss.length-1,Math.floor(q*ss.length))]:52,midi=pct(.5)-cents/100,f0=440*Math.pow(2,(pct(.5)-69)/12);
 // energy contour, smoothed over ~a syllable (50 ms) and over a phrase (0.8 s), for intensity and space
 const act=[],sm=[];let ea=0;for(let i=0;i<ev.length;i+=2){const v=Math.max(ev[i]||0,ev[i+1]||0);ea+=(v-ea)*(v>ea?.6:.25);act.push(Math.min(1,ea))}
 {let acc=0;const W=16;for(let i=0;i<act.length;i++){acc+=act[i];if(i>=W)acc-=act[i-W];sm.push(acc/Math.min(i+1,W))}}
 // pulse: autocorrelation of onset strength (positive energy steps) at beat-sized lags
 const os=ev.map((v,i)=>Math.max(0,v-(ev[i-1]||0)));const om=os.reduce((a,b)=>a+b,0)/Math.max(1,os.length);for(let i=0;i<os.length;i++)os[i]-=om;let r0=0;for(const x of os)r0+=x*x;const acf=[];
 for(let lg=Math.round(.33/hop);lg<=Math.round(1.25/hop);lg++){let r=0;for(let i=lg;i<os.length;i++)r+=os[i]*os[i-lg];acf.push([lg*hop,r0>0?r/r0*os.length/Math.max(1,os.length-lg):0])}
 return{len,rate:on/Math.max(.5,len),pauses,onsets:pauses.map(p=>p.t+p.d),f0,midi,pc:mod(Math.round(midi),12),cents,hist,ph,range:[pct(.1)-cents/100,pct(.9)-cents/100],act,smooth:sm,actHop:hop*2,acf,energy:sum/Math.max(1,n)}}
function pitch(d,i,sr){const N=1024,a=Math.round(sr/400),b=Math.round(sr/70);if(i<0||i+N+b>d.length)return 0;let r0=0;for(let j=0;j<N;j++)r0+=d[i+j]*d[i+j];if(r0<1e-4)return 0;const rr=new Float32Array(b+1);let best=0;for(let l=a;l<=b;l++){let r=0;for(let j=0;j<N;j++)r+=d[i+j]*d[i+j+l];rr[l]=r;if(r>best)best=r}if(best/r0<.3)return 0;for(let l=a+1;l<b;l++)if(rr[l]>.88*best&&rr[l]>=rr[l-1]&&rr[l]>=rr[l+1])return sr/l;return 0}


/* ---------- genre blend: the sliders apply to every bed; each part, groove and space is drawn by slider weight ---------- */
// ---- variety: each bed shifts its own harmony, patterns, tempo and mix within what still sounds like the genre ----
const CALT={triad:['triad','triad','pop','bright'],pop:['pop','pop','triad','bright','soul'],jazz:['jazz','jazz','soul','gospel','funk'],cine:['cine','cine','triad','pop'],soul:['soul','soul','gospel','jazz','pop'],lofi:['lofi','lofi','jazz','soul'],bright:['bright','bright','pop','triad'],bossa:['bossa','bossa','jazz'],gospel:['gospel','gospel','soul','jazz'],funk:['funk','funk','jazz','soul']};
const PALT={pop:['pop','pop','anthem','soul','folk'],folk:['folk','folk','modal','pop'],soul:['soul','soul','gospel','jazz','pop'],modal:['modal','modal','folk','ambient'],cine:['cine','cine','epic','ambient','modal'],ambient:['ambient','ambient','modal','cine'],epic:['epic','epic','cine','anthem'],lofi:['lofi','lofi','jazz','soul'],jazz:['jazz','jazz','soul','bossa'],bossa:['bossa','bossa','jazz'],gospel:['gospel','gospel','soul'],funk:['funk','funk','soul','jazz'],anthem:['anthem','anthem','pop','epic'],flamenco:['flamenco']};
const ELECG=k=>{const f=GFAM[k]||[];return f.filter(x=>/^syn/.test(x)).length>=2};
let PATPOOL=null;
const patPool=(rn,elec)=>{if(!PATPOOL)PATPOOL={};const ck=rn+(elec?'|e':'|a');if(PATPOOL[ck])return PATPOOL[ck];const out=new Set();
 for(const k in G){if(!!ELECG(k)!==!!elec)continue;const r=G[k].roles&&G[k].roles[rn];if(r&&r.pat)for(const q of r.pat)out.add(q)}
 return PATPOOL[ck]=[...out]};
function fingerprint(pc){if(!pc||!pc.mel||pc.mel.length<6)return null;const m=pc.mel,beats=Math.max(1,(pc.len||m[m.length-1][0]+1)),n=m.length;
 let off=0,leap=0,short=0,sumD=0,sumD2=0,lo=127,hi=0,sumM=0,dirc=0,prevDir=0;
 for(let i=0;i<n;i++){const[t,d,p]=m[i];if(Math.abs(t-Math.round(t))>1e-6)off++;if(d<.3)short++;sumD+=d;sumD2+=d*d;if(p<lo)lo=p;if(p>hi)hi=p;sumM+=p;
  if(i){const iv=p-m[i-1][2];leap+=Math.abs(iv);const dir=Math.sign(iv);if(dir&&prevDir&&dir!==prevDir)dirc++;if(dir)prevDir=dir}}
 const dens=n/beats,md=sumD/n,sd=Math.sqrt(Math.max(0,sumD2/n-md*md)),bar=pc.bar||4,
  chRate=pc.chords&&pc.chords.length?pc.chords.length/(beats/bar):1,
  phr=pc.phr&&pc.phr.length>1?beats/pc.phr.length:8,
  u=(x,a,b)=>clamp((x-a)/(b-a),0,1);
 return{dens:u(dens,.35,2.6),sync:u(off/n,0,.55),leap:u(leap/Math.max(1,n-1),1,5.5),range:u(hi-lo,7,31),reg:u(sumM/n,52,76),
  chRate:u(chRate,.3,2.2),phrase:u(phr,3,16),durVar:u(sd/Math.max(.1,md),.1,1.1),turn:u(dirc/Math.max(1,n-1),.1,.6),short:u(short/n,0,.6),
  raw:{notes:n,beats:+beats.toFixed(1),perBeat:+dens.toFixed(2),lo,hi,chordsPerBar:+chRate.toFixed(2),phraseBeats:+phr.toFixed(1)}}}
function vary(S0,o){const amt=(o.song||{}).variety??1;if(amt<=0)return S0;
 const FP=fingerprint(o.piece),F0=o.faith??.7,EXAG=1+(1-F0)*2.1*amt,
  V=rng((o.seed^0x7a71e7)>>>0),n=o.blend?Object.keys(o.blend).filter(k=>G[k]&&o.blend[k]>0).length:1,
  // more genres turned up widens the range a bed may wander
  w=clamp(amt*(.55+.45*Math.min(1,Math.sqrt(n)/3.2)),0,2),chance=p=>V()<p*w,
  S={...S0,roles:{},bands:S0.bands.map(b=>({...b})),mix:{...S0.mix},master:{...S0.master},modes:{...S0.modes},bpm:S0.bpm.slice()};
 // harmony flavour and progression family shift to a neighbour
 const fpMix=(k,d)=>FP?FP[k]*.65+V()*.35:d===undefined?V():d;
 if(S0.color&&CALT[S0.color]&&chance(.5*EXAG)){const a=CALT[S0.color];S.color=a[Math.min(a.length-1,Math.floor(fpMix('turn')*a.length))]}
 if(S0.prog&&PALT[S0.prog]&&chance(.45*EXAG)){const a=PALT[S0.prog];S.prog=a[Math.min(a.length-1,Math.floor(fpMix('chRate')*a.length))]}
 if(FP)S.melody=FP.leap>.55?'hook':FP.leap<.3?'lyric':S0.melody;else if(chance(.2))S.melody=S0.melody=='hook'?'lyric':'hook';
 // tempo: a wider window than the genre's default
 {const c0=(S0.bpm[0]+S0.bpm[1])/2,sp=(S0.bpm[1]-S0.bpm[0])/2,shift=FP?(.5-FP.dens)*sp*.9*EXAG:0,c=c0+shift,wid=sp*(1+.45*w*EXAG);S.bpm=[Math.max(48,c-wid),Math.min(196,c+wid)]}
 // swing, push and drag drift a little
 {const sy=FP?FP.sync:V();S.sw=clamp((S0.sw||0)*(.7+.6*V())+(S0.sw?(sy-.5)*.12*EXAG:0),0,.6);S.push=clamp((S0.push??.3)+(sy-.5)*.5*EXAG,0,1);S.lag=(S0.lag||1)*(.9+.2*V())+(FP?(FP.dens-.5)*.1:0)}
 // each part: its pattern may come from a wider pool of the same kind, and optional parts come and go
 const elec=S0.slots?ELECG(S0.slots.ins):o.blend?null:ELECG(o.genre);
 const busy=FP?FP.dens*.6+FP.short*.4:V();
 for(const rn in S0.roles){const r0=S0.roles[rn],r={...r0};
  if(r0.pat&&r0.pat.length&&!r0.keep&&chance(.4*EXAG)){const pool=patPool(rn,elec===null?V()<.5:elec).filter(q=>!r0.pat.includes(q));if(pool.length)r.pat=[...r0.pat,pool[Math.floor(V()*pool.length)]]}
  if(r0.p!=null)r.p=clamp(r0.p*(.6+.8*V())*(.75+.5*busy),0,1);
  if(r0.p==null&&/^(riff|counter|color|pad2|dbl)$/.test(rn)&&chance(.15+.25*(1-busy)))r.p=.75;
  if(FP&&r0.reg){const sh=Math.round((FP.reg-.5)*(/^(bass|sub)$/.test(rn)?3:7)*EXAG);if(sh)r.reg=[clamp(r0.reg[0]+sh,20,100),clamp(r0.reg[1]+sh,24,104)]}
  S.roles[rn]=r}
 // the mix itself breathes: width, warmth, air, glue and tilt differ per bed
 for(const[k,lo,hi]of[['side',.92,1.1],['sat',.7,1.35],['air',.8,1.25],['low',.9,1.12]])if(typeof S.master[k]=='number')S.master[k]=S.master[k]*(lo+(hi-lo)*V());
 if(typeof S.master.tilt=='number')S.master.tilt=clamp(S.master.tilt+(V()-.5)*.22*w,-.6,.6);
 S.fpPH=FP?(FP.phrase>.55?16:FP.phrase<.28?4:8):null;S.fpARC=FP?(.05+.16*FP.durVar)*EXAG:null;S.fpParts=FP?clamp(3+Math.round(busy*4.5),3,7):null;
 S.varied={source:FP?FP.raw:null,exaggeration:+EXAG.toFixed(2),amount:+w.toFixed(2),color:S.color,prog:S.prog,melody:S.melody,bpm:S.bpm.map(x=>+x.toFixed(1))};
 return S}
function blendG(W,seed,opt){const ids=Object.keys(W||{}).filter(k=>G[k]&&W[k]>0).sort((a,b)=>W[b]-W[a]);if(!ids.length)return G.indie;if(ids.length==1)return G[ids[0]];
 const R=rng((seed^0xb1e55)>>>0),tot=ids.reduce((a,k)=>a+W[k],0),wt=k=>W[k]/tot,ST=clamp((opt&&opt.style)??.6,0,1),AV=(opt&&opt.avoidGenres)||{},
  // weighted pick: each slot leans on the genres you turned up, shies away from what recent beds used, and ST decides how far it may stray from the dominant genre
  pick=(slot,f)=>{const c=ids.filter(f||(()=>true));if(!c.length)return null;const dom=c[0],w=c.map(k=>{let v=W[k]*Math.pow(.45,(AV[slot+':'+k]||0));if(k!==dom)v*=ST*ST*2.2;return Math.max(1e-6,v)});
   let x=R()*w.reduce((a,b)=>a+b,0);for(let i=0;i<c.length;i++){x-=w[i];if(x<=0)return c[i]}return c[c.length-1]},
  draw=pick.bind(null,'x'),avg=f=>ids.reduce((a,k)=>a+wt(k)*f(G[k]),0),
  // a continuous setting comes from the genre that won its slot, jittered, not from the average of everything
  pin=(k,f,d)=>{const g=G[k];let v=f(g);if(v==null)v=avg(f);return v==null?d:v*(.85+.3*R())};
 const hg=pick('harm'),dg=pick('groove',k=>(G[k].grooves||[]).length&&(G[k].drumP??1)>0),ig=pick('ins'),tgx=pick('tempo'),mg=pick('master'),H0=G[hg],D0=dg?G[dg]:{kits:[],grooves:[],drumP:0},T0=G[tgx]||H0,M0=G[mg]||H0;
 const S={n:'',d:'',bpm:((dg&&R()<.5?D0:T0).bpm||H0.bpm).slice(),modes:{},sw:pin(dg||hg,g=>g.sw||0,0),sw16:pin(dg||hg,g=>g.sw16||0,0),lag:pin(dg||hg,g=>g.lag||1,1),push:pin(dg||hg,g=>g.push??.3,.3),color:H0.color,prog:H0.prog,melody:H0.melody,blue:H0.blue,
  kits:D0.kits,alias:D0.alias,grooves:D0.grooves,drumP:dg?(()=>{let w=0,v=0;for(const k of ids){const g=G[k];if(!(g.grooves||[]).length||!(g.drumP??1))continue;w+=wt(k);v+=wt(k)*(g.drumP??1)}return w>0?Math.min(1,v/w):1})():0,under:D0.under,fill:D0.fill,stop:D0.stop,drumEnter:D0.drumEnter,arc:avg(g=>g.arc?1:0)>=.5?1:0,pump:avg(g=>g.pump||0),fm:H0.fm||0,edm:H0.edm||D0.edm||null,
  roles:{},bands:[{}],mix:{},fx:{...(D0.fx||{}),...(H0.fx||{}),...(M0.fx||{})},master:{},bal:H0.bal,feelFrom:dg||hg,insFrom:ig};
 
 {const hm=H0.modes,ht=Object.values(hm).reduce((a,b)=>a+b,0);for(const m in hm)S.modes[m]=.7*hm[m]/ht;for(const k of ids){const g=G[k],t=Object.values(g.modes).reduce((a,b)=>a+b,0);for(const m in g.modes)S.modes[m]=(S.modes[m]||0)+.3*wt(k)*g.modes[m]/t}}
 const from={},gP=G[ig]||H0,band=gP.bands[Math.floor(R()*gP.bands.length)];for(const rn in band){if(!gP.roles[rn])continue;S.roles[rn]=gP.roles[rn];S.bands[0][rn]=band[rn];if(gP.mix&&gP.mix[rn])S.mix[rn]=gP.mix[rn]}from[ig||hg]=1;
 {const base=2+Math.round(Math.sqrt(ids.length)*1.3),want=clamp(Math.round(base+(R()<.5?-1:1)*Math.floor(R()*2.6)),3,7),order=['lead','keys','pulse','bass','pad','riff','counter','color'].sort(()=>R()-.5);
  for(let guard=0;guard<24&&Object.keys(S.roles).length<want;guard++){const k=pick('ins',q=>q!=ig&&G[q].bands.some(b=>Object.keys(b).some(rn=>!S.roles[rn]&&G[q].roles[rn])));if(!k)break;const g=G[k],bd=g.bands[Math.floor(R()*g.bands.length)];
   const cands=order.filter(rn=>!S.roles[rn]&&bd[rn]&&g.roles[rn]);if(!cands.length)continue;const rn=cands[0];
   S.roles[rn]=g.roles[rn];S.bands[0][rn]=bd[rn];if(g.mix&&g.mix[rn])S.mix[rn]=g.mix[rn];from[k]=1}}
 const fg=pick('lead',k=>k!=ig&&G[k].roles.lead&&G[k].bands.some(b=>b.lead));if(fg&&R()<.25+.5*ST){const g=G[fg],bs=g.bands.filter(b=>b.lead);S.roles.lead=g.roles.lead;S.bands[0].lead=bs[Math.floor(R()*bs.length)].lead;from[fg]=1}
 if(dg)for(const d of['kick','snare','hat','cym','tom','perc','drums'])if(D0.mix&&D0.mix[d])S.mix[d]=D0.mix[d];
 for(const key in MASTER){const mv=merge(MASTER,M0.master||{})[key];S.master[key]=typeof MASTER[key]=='number'?mv*.65+avg(g=>merge(MASTER,g.master||{})[key])*.35:mv}
 const shown=ids.filter(k=>from[k]||k==dg||k==hg);S.n=shown.slice(0,3).map(k=>G[k].n).join(' × ')+(shown.length>3?' +'+(shown.length-3):'');S.d='Blend of '+ids.map(k=>G[k].n+' '+Math.round(wt(k)*100)+'%').join(', ');
 S.fav=[...new Set([].concat(...Object.keys(from).map(k=>G[k].fav||[])))];S.parts=from;S.drumsFrom=dg;S.harmonyFrom=hg;S.slots={harm:hg,groove:dg,ins:ig||hg,tempo:tgx,master:mg,lead:fg||null};return S}
/* ---------- the source library: thousands of public-domain pieces, loaded a chunk at a time ---------- */
const LIBC={};let LIBI=null;const libBase=()=>(window.PBC_LIB||'lib/');
async function libJSON(f){if(LIBC[f])return LIBC[f];const p=fetch(libBase()+f).then(r=>{if(!r.ok)throw new Error('library '+r.status);return r.json()});LIBC[f]=p;try{return await p}catch(e){delete LIBC[f];throw e}}
async function pickPiece(seed,avoid,faith,gk){if(!LIBI)LIBI=await libJSON('index.json');const R=rng((seed^0x5eed11)>>>0),N=LIBI.n.length,straight=gk&&!FOLKG.has(gk),pS=!gk||FOLKG.has(gk)?1:POPG.has(gk)?.45:.12;let last=null;for(let t=0;t<30;t++){let i=Math.floor(R()*N);for(let u=0;u<60&&((avoid&&avoid.has(i))||(faith>=.75&&LIBI.n[i][2]));u++)i=Math.floor(R()*N);const[ch,j]=LIBI.n[i];const arr=await libJSON('c'+String(ch).padStart(2,'0')+'.json');const pc=arr[j];pc._i=i;last=pc;const m=pc.meter||[4,4],odd=(m[1]==8&&m[0]%3==0)||m[0]==3,trad=/Traditional/.test(pc.composer||'');if(straight&&odd&&t<25)continue;if(trad&&R()>pS&&t<25)continue;return pc}return last}
/* ---------- score arranger: how closely a bed follows its public-domain source ----------
   F = 1: the score as written (its melody, its chords with their real timing, its bass line).
   F = 0: a new composition from the score: the opening motif developed (sequence, inversion,
   retrograde, augmentation), reharmonised with Tonal's key vocabulary under the source's
   phrase and cadence plan. In between, each layer moves by degrees.
   Everything here is in pitch relative to the tonic, and in beats from the start of the bed. */
const TYPEQ={'major':'maj','minor':'m','dominant seventh':'7','major seventh':'maj7','minor seventh':'m7','half-diminished':'hdim','diminished':'dim','diminished seventh':'dim7','suspended fourth':'sus4','suspended second':'sus2'};
function tonalVocab(mode,jazzy){const T=window.Tonal,out=[],seen=new Set();
 const add=(sym,w,fn)=>{if(!sym)return;let rel,q;if(T){const c=T.Chord.get(sym);if(!c||c.empty)return;q=TYPEQ[c.type];if(!q||!Q[q])return;rel=T.Note.chroma(c.tonic)}else return;const k=rel+':'+q;if(seen.has(k))return;seen.add(k);out.push({rel,q,w,fn,pcs:Q[q].map(x=>(rel+x)%12)})};
 if(T){if(mode=='min'||mode=='dor'){const k=T.Key.minorKey('C');const W=[1,.15,.55,.75,.45,.6,.65];k.natural.triads.forEach((s,i)=>add(s,W[i],'d'+i));add('G',.75,'V');add('G7',.6,'V7');if(mode=='dor')add('F',.7,'IV');if(jazzy){k.natural.chords.forEach((s,i)=>add(s,W[i]*.8,'d'+i));add('Dm7b5',.45,'ii')}}
  else{const k=T.Key.majorKey('C');const W=[1,.6,.3,.85,.9,.75,.05];k.triads.forEach((s,i)=>add(s,W[i],'d'+i));
   if(jazzy){k.chords.forEach((s,i)=>add(s,W[i]*.85,'d'+i));k.secondaryDominants.forEach((s,i)=>add(s,.32,'sec'+i));k.substituteDominants.forEach((s,i)=>add(s,.12,'sub'+i))}
   else{k.secondaryDominants.forEach((s,i)=>i>=1&&i<=5&&add(s,.18,'sec'+i));add('Bb',mode=='mix'?.85:.28,'bVII');add('Fm',.18,'iv');add('Ab',.14,'bVI')}
   if(mode=='mix')add('Gm',.5,'v')}}
 if(!out.length){const sc=SC[mode]||SC.maj;for(let i=0;i<7;i++){const r=sc[i],t=sc[(i+2)%7],f=sc[(i+4)%7],q=(mod(t-r,12)==4&&mod(f-r,12)==7)?'maj':(mod(t-r,12)==3&&mod(f-r,12)==7)?'m':'dim';out.push({rel:r,q,w:i==0?1:.6,fn:'d'+i,pcs:Q[q].map(x=>(r+x)%12)})}}
 return out}
function scorePlan(piece,F,S,R,H,need,mode){
 const f=1-F,sc=SC[mode]||SC.maj,meter=piece.meter||[piece.bar==3?3:4,4],compound=meter[1]==8&&meter[0]%3==0,beatQ=compound?1.5:1,bpbQ=piece.bar,bpb=Math.round(bpbQ/beatQ),triple=bpb==3;
 // beats per source bar after mapping: duple metres keep their rhythm exactly; triple metres are re-barred into four
 const barB=triple?4:bpb,L2q=Math.ceil(piece.len/bpbQ-1e-6)*bpbQ,L2B=(L2q/bpbQ)*barB;
 const qToB=q=>{const bar=Math.floor(q/bpbQ+1e-9),pos=(q-bar*bpbQ)/beatQ;const b=triple?(pos<1?pos*2:2+(pos-1)):pos;return bar*barB+b};
 // where in the score to start: a phrase start that lets a phrase end land near the end of the bed
 const pe=(piece.phr&&piece.phr.length?piece.phr:[piece.len]).map(qToB);
 const starts=[...new Set([0,...pe].map(ps=>{const n=piece.mel.find(m=>qToB(m[0])>=ps-1e-6);return n?Math.ceil(qToB(n[0])/barB-.01)*barB:null}).filter(x=>x!=null&&x<L2B))];
 let p0=0,best=-1e9;for(const s0 of starts){const e=s0+need;let dd=1e9;for(const q of pe)dd=Math.min(dd,Math.abs(q-e));if(e>L2B+1e-6)dd+=2;const v=-dd-.012*s0+R()*.6;if(v>best){best=v;p0=s0}}
 const span=need+16,loops=Math.ceil((p0+span)/L2B)+1;
 const seq=(arr,withEnd)=>{const out=[];for(let k=0;k<loops;k++)for(const n of arr){const a=qToB(n[0])+k*L2B-p0,b=qToB(n[0]+n[1])+k*L2B-p0;if(b<-8||a>span)continue;out.push([a,Math.max(.12,b-a),...n.slice(2)])}return out.sort((x,y)=>x[0]-y[0])};
 const srcMel=seq(piece.mel),srcCh=seq(piece.chords),srcBass=piece.bass&&piece.bass.length?seq(piece.bass):null;
 const phrB=[];for(let k=0;k<loops;k++)for(const q of pe)phrB.push(q+k*L2B-p0);
 const deg=rel=>{let bd=99,bi=0;for(let k=-21;k<=35;k++){const v=12*Math.floor(k/7)+sc[mod(k,7)];const d=Math.abs(v-rel);if(d<bd){bd=d;bi=k}}return bi},fromDeg=k=>12*Math.floor(k/7)+sc[mod(k,7)];
 // ---- harmony ----
 const srcAt=B=>{let c=null;for(const x of srcCh){if(x[0]<=B+1e-6)c=x;else break}return c||srcCh[0]};
 let chords;
 if(F>=.66){chords=[];for(const x of srcCh){if(chords.length&&x[1]<.5&&F<.9){continue}chords.push({B:x[0],rel:x[2],bass:x[3],q:x[4],src:1})}}
 else{const jazzy=['jazz','soul','lofi','bossa'].includes(S.color),V=tonalVocab(mode,jazzy),step=2,n=Math.ceil((span+8)/step),lam=2.4*F/.66;
  const em=[];for(let i=0;i<n;i++){const a=i*step-8,b=a+step,src=srcAt(a+.01);em.push(V.map(c=>{let s=0,W=0;for(const m of srcMel){const x0=Math.max(m[0],a),x1=Math.min(m[0]+m[1],b);if(x1<=x0)continue;const strong=Math.abs(m[0]-a)<1e-6?1.8:Math.abs(mod(m[0],1))<1e-6?1.25:1,w=(x1-x0)*strong,pc=mod(m[2],12);s+=w*(c.pcs.includes(pc)?1:sc.includes(pc)?-.2:-1);W+=w}
   let v=(W?s/W:0)*2.2+c.w*.5+R()*.18;if(src&&c.rel==src[2]&&(c.q==src[4]||Q[c.q]&&Q[src[4]]&&Q[c.q][1]==Q[src[4]][1]))v+=lam;const end=phrB.some(p=>Math.abs(p-b)<.6);if(end&&c.rel==0)v+=1.1;return v}))}
  const NV=V.length,Vt=[],Bk=[];Vt.push(em[0].slice());Bk.push(new Array(NV).fill(0));
  for(let i=1;i<n;i++){const row=new Array(NV).fill(-1e9),bk=new Array(NV).fill(0);for(let j=0;j<NV;j++)for(let k=0;k<NV;k++){const a=V[k],b=V[j];let t=Vt[i-1][k]+(j==k?.2:0);const dn=mod(a.rel-b.rel,12);if(j!=k){if(dn==7)t+=.38;else if(dn==2||dn==10)t+=.1}if(a.fn&&a.fn.startsWith('sec')&&mod(a.rel-b.rel,12)!=7)t-=1.2;if(a.fn&&a.fn.startsWith('sub')&&mod(a.rel-b.rel,12)!=1)t-=1.2;if(j!=k&&mod(i*step,4)>1e-6)t-=.3;if(t>row[j]){row[j]=t;bk[j]=k}}for(let j=0;j<NV;j++)row[j]+=em[i][j];Vt.push(row);Bk.push(bk)}
  let j=0;for(let k=1;k<NV;k++)if(Vt[n-1][k]>Vt[n-1][j])j=k;const path=[j];for(let i=n-1;i>0;i--){j=Bk[i][j];path.push(j)}path.reverse();
  chords=[];path.forEach((j,i)=>{const c=V[j],B=i*step-8;if(chords.length&&chords[chords.length-1].rel==c.rel&&chords[chords.length-1].q==c.q)return;chords.push({B,rel:c.rel,bass:c.rel,q:c.q})})}
 const chAt=B=>{let c=chords[0];for(const x of chords){if(x.B<=B+1e-6)c=x;else break}return c};
 const ctOf=c=>Q[c.q].map(x=>(c.rel+x)%12);
 // ---- melody ----
 // the tune is never played note for note: it is reduced to its structural notes (one per beat or half bar),
 // chosen by metric weight, length and fit with the harmony, and joined into long, singable lines
 const dens=srcMel.filter(m=>m[0]>=0&&m[0]<32).length/32,win=dens>1.3||F<.5?2:1;
 let mel=[];{const raw=srcMel.map(m=>({B:m[0],d:m[1],rel:m[2]})),t0=Math.floor(Math.min(...raw.map(m=>m.B))/win)*win;
  for(let w=t0;w<span+win;w+=win){const inW=raw.filter(m=>m.B>=w-1e-6&&m.B<w+win-1e-6);if(!inW.length)continue;const ct=ctOf(chAt(w+.01));
   let best=null,bs=-1e9;for(const m of inW){const v=Math.min(m.d,win)*1.4+(Math.abs(m.B-w)<1e-6?1.2:Math.abs(mod(m.B,1))<1e-6?.4:0)+(ct.includes(mod(m.rel,12))?1:0);if(v>bs){bs=v;best=m}}
   const last=mel[mel.length-1];if(last&&last.rel==best.rel&&last.B+last.d>=w-1e-6){last.d=w+win-last.B;continue}mel.push({B:w,d:win,rel:best.rel})}}
 for(const p of phrB){const m=mel.find(x=>x.B<p-1e-6&&x.B+x.d>p-1e-6);if(m&&m.d>1)m.d-=.5}
 const strongB=B=>Math.abs(mod(B,2))<1e-6;
 // keep strong-beat notes inside a new harmony (only when the harmony moved away from the source)
 if(F<.66)for(const m of mel){if(!strongB(m.B))continue;const c=chAt(m.B),ct=ctOf(c);if(ct.includes(mod(m.rel,12)))continue;for(const dd of[-1,1,-2,2]){const r2=fromDeg(deg(m.rel)+(dd>0?1:-1)*Math.ceil(Math.abs(dd)/2));if(ct.includes(mod(r2,12))){m.rel=r2;break}}}
 // development: units of two bars after the first statement are transformed with growing freedom
 const unit=8,motif=mel.filter(m=>m.B>=0&&m.B<unit).map(m=>({o:m.B,d:m.d,k:deg(m.rel)}));
 if(f>.45&&motif.length>=3){const gen=clamp((f-.45)/.55,0,1),out=mel.filter(m=>m.B<unit);
  for(let u=unit;u<span;u+=unit){const src=mel.filter(m=>m.B>=u&&m.B<u+unit);if(R()>gen&&src.length){out.push(...src);continue}
   const op=H.pick(['seq','seq','inv','retro','aug','orig','dim']),c0=chAt(u),k0=motif[0].k,shift=op=='seq'?H.pick([-2,-1,1,2,3]):0;
   let notes=motif.map(n=>({o:n.o,d:n.d,k:n.k}));
   if(op=='inv')notes=notes.map(n=>({...n,k:2*k0-n.k}));
   if(op=='retro'){const tot=notes.length;notes=notes.map((n,i)=>({o:n.o,d:n.d,k:motif[tot-1-i].k}))}
   if(op=='aug')notes=notes.filter(n=>n.o<unit/2).map(n=>({o:n.o*2,d:n.d*2,k:n.k}));
   if(op=='dim'){const half=notes.map(n=>({o:n.o/2,d:n.d/2,k:n.k}));notes=half.concat(half.map(n=>({...n,o:n.o+unit/2,k:n.k+1})))}
   // aim the unit at the chord: move the whole shape so its first note is a chord tone
   const ct=ctOf(c0);let best2=0,bd2=99;for(let s2=-4;s2<=4;s2++){const r2=fromDeg(notes[0].k+shift+s2);if(ct.includes(mod(r2,12))&&Math.abs(s2)<bd2){bd2=Math.abs(s2);best2=s2}}
   for(const n of notes){const B=u+n.o;if(B>=span)continue;let r2=fromDeg(n.k+shift+best2);const c=chAt(B),ctt=ctOf(c);if(strongB(B)&&!ctt.includes(mod(r2,12))){for(const s3 of[1,-1,2,-2]){if(ctt.includes(mod(fromDeg(n.k+shift+best2+s3),12))){r2=fromDeg(n.k+shift+best2+s3);break}}}out.push({B,d:n.d,rel:r2})}}
  mel=out.sort((a,b)=>a.B-b.B)}
 // ornament and push: passing and neighbour tones, anticipations
 if(f>.12){const out=[];for(let i=0;i<mel.length;i++){const m=mel[i],nx=mel[i+1];out.push(m);if(!nx)continue;const gap=nx.B-m.B,dk=deg(nx.rel)-deg(m.rel);
   if(m.d>=2&&gap>=2&&Math.abs(dk)==2&&R()<.35*f){m.d=gap/2;out.push({B:m.B+gap/2,d:gap/2,rel:fromDeg(deg(m.rel)+Math.sign(dk))})}
   else if(false){const h=m.d/2;m.d=h*.5;out.push({B:m.B+h*.5,d:h*.5,rel:fromDeg(deg(m.rel)+1)},{B:m.B+h,d:h,rel:m.rel})}}
  mel=out;for(const m of mel)if(strongB(m.B)&&m.B>.5&&m.d>=2&&R()<.25*f){m.B-=.5;m.d+=.5}}
 // a harmony voice a diatonic third or sixth away on long notes: more of it as the arrangement opens up
 const harm=[];if(f>.15&&f<.95)for(const m of mel){if(m.d<1||R()>.6*Math.min(1,f*1.6))continue;const c=chAt(m.B),ct=ctOf(c);for(const dk of[-2,-5,2]){const r2=fromDeg(deg(m.rel)+dk);if(ct.includes(mod(r2,12))){harm.push({B:m.B,d:m.d,rel:r2});break}}}
 const bass=F>=.75&&srcBass?srcBass.map(m=>({B:m[0],d:m[1],rel:m[2]})):null;
 return{mel,harm,chords,bass,p0,barB,triple,compound,chAt,L2B}}

/* ---------- The Session: tens of thousands of traditional tunes, fetched and converted by the app itself ----------
   The app downloads the public tunes file from the TheSession-data repository the first time it runs, keeps it in the
   browser cache, reads each tune's ABC notation, and harmonises it with the same chord-finding the library uses. */
const SESSION_URL='https://raw.githubusercontent.com/adactio/TheSession-data/main/json/tunes.json';
let SESS=null,SESSP=null;
async function sessionTunes(){if(SESS)return SESS;if(SESSP)return SESSP;
 SESSP=(async()=>{let txt=null,cache=null;try{if(window.caches)cache=await caches.open('pbc-session-v1');const r=cache&&await cache.match(SESSION_URL);if(r)txt=await r.text()}catch(e){}
  if(!txt){const r=await fetch(SESSION_URL);if(!r.ok)throw new Error('The Session '+r.status);txt=await r.text();try{cache&&await cache.put(SESSION_URL,new Response(txt,{headers:{'content-type':'application/json'}}))}catch(e){}}
  const all=JSON.parse(txt),seen=new Set(),out=[];for(const t of all){if(!t||!t.abc||seen.has(t.tune_id))continue;seen.add(t.tune_id);out.push(t)}SESS=out;return out})();
 try{return await SESSP}catch(e){SESSP=null;throw e}}
async function sessionFromFile(file){const txt=await file.text();if(txt.trim()[0]!='[')throw new Error('That is not The Session tunes.json file');try{if(window.caches){const c=await caches.open('pbc-session-v1');await c.put(SESSION_URL,new Response(txt,{headers:{'content-type':'application/json'}}))}}catch(e){}SESS=null;SESSP=null;const all=JSON.parse(txt),seen=new Set(),out=[];for(const t of all){if(!t||!t.abc||seen.has(t.tune_id))continue;seen.add(t.tune_id);out.push(t)}SESS=out;return out}
const ABC_MODES={major:'maj',minor:'min',dorian:'dor',mixolydian:'mix',aeolian:'min',ionian:'maj'};
const LETTER_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function abcToPiece(t){
 const ms=/^([A-G])([b#]?)(\w+)$/.exec(String(t.mode||'').trim());if(!ms)return null;const md=ABC_MODES[ms[3].toLowerCase()];if(!md)return null;
 const tonicName=ms[1]+(ms[2]||''),tonic=mod(LETTER_PC[ms[1]]+(ms[2]=='#'?1:ms[2]=='b'?-1:0),12);
 const mt=/^(\d+)\/(\d+)$/.exec(String(t.meter||'4/4').trim());if(!mt)return null;const num=+mt[1],den=+mt[2];
 if(![[4,4],[2,4],[3,4],[6,8],[12,8],[9,8],[2,2],[3,2]].some(([a,b])=>a==num&&b==den))return null;
 const bar=num*4/den,unit=.5;
 // key signature: which letters carry sharps or flats, from the mode's scale (Tonal when present)
 const ksig={};{let notes=null;try{const T=window.Tonal;if(T){const sc=T.Scale.get(tonicName+' '+({maj:'major',min:'minor',dor:'dorian',mix:'mixolydian'})[md]);if(sc&&!sc.empty)notes=sc.notes}}catch(e){}
  if(!notes){const pcs=(SC[md]||SC.maj).map(x=>(tonic+x)%12);for(const L in LETTER_PC){const p=LETTER_PC[L];ksig[L]=pcs.includes(p)?0:pcs.includes((p+1)%12)?1:pcs.includes((p+11)%12)?-1:0}}
  else for(const n of notes){const L=n[0],acc=n.slice(1);ksig[L]=acc=='#'?1:acc=='##'?2:acc=='b'?-1:acc=='bb'?-2:0}}
 let s=String(t.abc).replace(/%[^\n]*/g,'').replace(/\\\n/g,' ').replace(/"[^"]*"/g,'').replace(/![^!]*!/g,'').replace(/\+[^+\s]*\+/g,'').replace(/\{[^}]*\}/g,'');
 if(/\[[KM]:/.test(s)||/^\s*[KM]:/m.test(s))return null; // key or metre changes mid-tune: leave those out
 s=s.replace(/^\s*[A-Za-z]:.*$/gm,'');
 const mel=[];let pos=0,barAcc={},skip=false,tup=0,tupN=0,broken=0,last=null,firstBar=null;
 let i=0;const N=s.length;
 const lenAt=()=>{let a=0,b=1,m=/^(\d*)(\/*)(\d*)/.exec(s.slice(i));i+=m[0].length;const n1=m[1]?+m[1]:1;let d=1;if(m[2]){const sl=m[2].length;d=m[3]?+m[3]:2**sl}return n1/d};
 while(i<N){const c=s[i];
  if(c=='|'||c==':'||(c=='['&&/[12|]/.test(s[i+1]||''))){let tok='';while(i<N&&/[|:\[\]12]/.test(s[i])){if(tok.length&&s[i]=='['&&!/[12|]/.test(s[i+1]||''))break;tok+=s[i++]}
   if(/[|\]:]/.test(tok)){if(firstBar==null&&pos>0)firstBar=pos;barAcc={}}
   if(/[\[|]1/.test(tok)&&!/2/.test(tok))skip=true;else if(/2/.test(tok))skip=false;
   continue}
  if(c=='('&&/\d/.test(s[i+1])){tup=+s[i+1];tupN=tup;i+=2;while(s[i]==':'||/\d/.test(s[i]))i++;continue}
  if(c=='>'||c=='<'){let k=0;while(s[i]==c){k++;i++}if(last){const f=c=='>'?1-.5**k:-(1-.5**k);const dd=last.d*f;last.d+=dd;pos+=dd;broken=-f}continue}
  let acc=null;if(c=='^'||c=='_'||c=='='){acc=0;while(s[i]=='^'||s[i]=='_'||s[i]=='='){acc+=s[i]=='^'?1:s[i]=='_'?-1:0;if(s[i]=='=')acc=0;i++}}
  const L=s[i];
  if(L&&/[A-Ga-gzx]/.test(L)){i++;let oct=0;while(s[i]==','||s[i]=="'"){oct+=s[i]==','?-1:1;i++}let d=lenAt()*unit;
   if(tup){d*=tup==3?2/3:tup==2?3/2:tup==4?3/4:(tup-1)/tup;tupN--;if(tupN<=0)tup=0}
   if(broken){d*=1+broken;broken=0}
   if(/[zx]/.test(L)){if(!skip)pos+=d;last=null;continue}
   const up=L.toUpperCase(),key2=up+oct+(L==up?0:1);if(acc!=null)barAcc[key2]=acc;const a=barAcc[key2]??ksig[up]??0;
   const midi=60+LETTER_PC[up]+a+12*(oct+(L==up?0:1));if(!skip){const n={o:pos,d,m:midi};mel.push(n);last=n;pos+=d}continue}
  if(c=='['){const j=s.indexOf(']',i);if(j<0)break;const inner=s.slice(i+1,j);i=j+1;const notes=[...inner.matchAll(/([\^_=]*)([A-Ga-g])([,']*)/g)];if(!notes.length)continue;
   let best=null;for(const nm of notes){const up=nm[2].toUpperCase(),oct=(nm[3].match(/'/g)||[]).length-(nm[3].match(/,/g)||[]).length+(nm[2]==up?0:1);const midi=60+LETTER_PC[up]+(ksig[up]||0)+12*oct;if(!best||midi>best)best=midi}
   let d=lenAt()*unit;if(!skip){const n={o:pos,d,m:best};mel.push(n);last=n;pos+=d}continue}
  i++}
 if(mel.length<16)return null;
 const pick=firstBar!=null&&firstBar>0&&firstBar<bar-1e-6?bar-firstBar:0;
 let m2=mel.map(n=>[+(n.o+pick).toFixed(3),+n.d.toFixed(3),n.m-tonic]);
 const end0=Math.min(Math.max(...m2.map(n=>n[0]+n[1])),32*bar+pick),end=Math.ceil(end0/bar-1e-6)*bar;m2=m2.filter(n=>n[0]<end);
 const rng2=Math.max(...m2.map(n=>n[2]))-Math.min(...m2.map(n=>n[2]));if(rng2>26)return null;
 const chords=harmonizeTune(m2,md,end,bar);if(chords.length<3)return null;
 const pl=bar>=3?4*bar:8*bar,phr=[];for(let x=pl;x<=end+1e-6;x+=pl)phr.push(+x.toFixed(3));
 return{title:String(t.name||'Untitled').trim(),composer:'Traditional · The Session ('+(t.type||'tune')+')',mode:md,meter:[num,den],bar,len:end,mel:m2,chords,phr,_i:'s'+t.tune_id}}
const HCANDS={maj:[[0,'maj',.4],[2,'m',.15],[4,'m',0],[5,'maj',.35],[7,'maj',.4],[7,'7',.22],[9,'m',.22]],min:[[0,'m',.4],[3,'maj',.25],[5,'m',.3],[7,'m',.1],[7,'maj',.3],[7,'7',.2],[8,'maj',.25],[10,'maj',.25]],
 dor:[[0,'m',.6],[2,'m',.1],[3,'maj',.2],[5,'maj',.35],[7,'m',.2],[10,'maj',.35]],mix:[[0,'maj',.6],[2,'m',.15],[5,'maj',.35],[7,'m',.2],[9,'m',.1],[10,'maj',.4]]};
function harmonizeTune(mel,md,end,bar){const step=bar<=3?bar:bar/2,n=Math.max(1,Math.ceil(end/step-1e-6)),C=HCANDS[md]||HCANDS.maj,sc=new Set(SC[md]||SC.maj);
 const em=[];for(let i=0;i<n;i++){const a=i*step,b=a+step;em.push(C.map(([rel,q,pr])=>{const cs=Q[q].map(x=>(rel+x)%12);let s=0,W=0;for(const[o,d,m]of mel){const x0=Math.max(o,a),x1=Math.min(o+d,b);if(x1<=x0)continue;const w=(x1-x0)*(Math.abs(o-a)<1e-6?1.7:Math.abs(mod(o-a,1))<1e-6?1.25:1),pc=mod(m,12);s+=w*(cs.includes(pc)?1:sc.has(pc)?-.25:-.8);W+=w}return(W?s/W:0)*2.2+pr*.5}))}
 const TR=(a,b)=>{const k=a[0]+a[1]+'>'+b[0];return{'7maj>0':.3,'77>0':.4,'5maj>0':.1,'5m>0':.1,'5maj>7':.12,'2m>7':.18,'10maj>0':.25,'9m>5':.1,'9m>2':.1,'8maj>10':.15}[k]||0};
 const V=[C.map((c,j)=>em[0][j]+(c[0]==0?.4:0))],Bk=[C.map(()=>0)];
 for(let i=1;i<n;i++){const row=[],bk=[];C.forEach((c,j)=>{let best=-1e9,bi=0;C.forEach((p,k)=>{let t=V[i-1][k]+(k==j?.18:0)+TR(p,c);if(k!=j&&step<bar&&mod(i*step,bar)>1e-6)t-=.25;if(t>best){best=t;bi=k}});row.push(best+em[i][j]+(i==n-1&&c[0]==0?1.2:0));bk.push(bi)});V.push(row);Bk.push(bk)}
 let j=0;V[n-1].forEach((v,k)=>{if(v>V[n-1][j])j=k});const path=[j];for(let i=n-1;i>0;i--){j=Bk[i][j];path.push(j)}path.reverse();
 const out=[];path.forEach((j,i)=>{const[rel,q]=C[j];const l=out[out.length-1];if(l&&l[2]==rel&&l[4]==q)l[1]=+(l[1]+step).toFixed(3);else out.push([+(i*step).toFixed(3),step,rel,rel,q])});return out}
const FOLKG=new Set(['folk','americana','campfire','world','chamber']),POPG=new Set(['indie','drivepop','anthem','epic','brooklyn','cinematic','bossa']);
const domG=o=>{if(o.blend){let b=null,w=-1;for(const k in o.blend)if(o.blend[k]>w){w=o.blend[k];b=k}return b}return o.genre};
async function pickAny(seed,avoid,faith,gk){const R=rng((seed^0x5e55)>>>0);let nLib=LIBI?LIBI.n.length:4400,nS=SESS?SESS.length:0;const pS=FOLKG.has(gk)?.75:POPG.has(gk)?.35:.08,straight=!FOLKG.has(gk);
 if(nS&&R()<pS){for(let t=0;t<60;t++){const tt=SESS[Math.floor(R()*nS)],id='s'+tt.tune_id;if(avoid&&avoid.has(id))continue;if((faith>=.75||straight)&&/^(3|6|9|12)\//.test(String(tt.meter)))continue;if(straight&&/jig|waltz|slide|mazurka|three-two/i.test(String(tt.type||'')))continue;const p=abcToPiece(tt);if(p)return p}}
 return pickPiece(seed,avoid,faith,gk)}

const eucl=(k,n,rot)=>{const a=[];for(let i=0;i<n;i++)a.push(Math.floor((i+rot)*k/n)!==Math.floor((i+rot-1)*k/n)?'x':'.');return a.join('')};
const GVAR=(g0,R,amt)=>{const g={...g0},set=(s0,i,c)=>s0.slice(0,i)+c+s0.slice(i+1);if(amt<=0)return g;const four=g.k&&g.k.slice(0,16)=='o...o...o...o...';
 if(g.h&&R()<amt*.7){const V=four?['x.x.x.x.x.x.x.x.','xxxxxxxxxxxxxxxx','x.xxx.xxx.xxx.xx','..x...x...x...x.']:['x.x.x.x.x.x.x.x.','xxxxxxxxxxxxxxxx','x.xxx.xxx.xxx.xx','x.x.x.xxx.x.x.xx','xx.xxx.xxx.xxx.x'];g.h=V[Math.floor(R()*V.length)]}
 if(g.k&&R()<amt*.6){let k=g.k.slice(0,16);const P=four?[15,7,14]:[3,6,7,10,11,14,15];const n=1+Math.floor(R()*amt*2.2);for(let j=0;j<n;j++){const i=P[Math.floor(R()*P.length)];if(k[i]=='.')k=set(k,i,'x')}g.k=k+(g.k.length>16?g.k.slice(16):'')}
 const sl=g.s?'s':g.cl?'cl':null;if(sl&&R()<amt*.55){let t=g[sl].slice(0,16);for(const i of[7,9,15,3])if(t[i]=='.'&&R()<.45)t=set(t,i,'g');g[sl]=t+(g[sl].length>16?g[sl].slice(16):'')}
 if(R()<amt*.8){const pool=['sh','tb','cb','ss','clv','rd','cab'].filter(x=>!g[x]);if(pool.length){const ln=pool[Math.floor(R()*pool.length)];g[ln]=eucl([3,5,7,9][Math.floor(R()*4)],16,Math.floor(R()*16))}}
 if(g.oh&&R()<amt*.4){g.oh=R()<.5?'..............x.':'......x.......x.'}
 return g};
/* ---------- the arranger: plan the song first, then fill it ----------
   1. Form: intro, verse under the read, a lift after it, a dominant into the final hit (the cadence lives in compose).
   2. Harmony: one proven chord loop, chosen because it fits the source melody's structural notes; at the
      "as written" end the source's own bar-by-bar harmony is the favourite. The lift may move to a related loop.
   3. Hook: the source's opening motif, simplified to an even rhythm grid and fitted to the loop. It answers the
      read in its pauses and is stated in full (statement + answer) in the lift. No melody runs under the voice. */
function arrangePlan(piece,F,S,R,H,ctx,mode){
 const{bbB,ib,postB,gaps}=ctx,sc=SC[mode]||SC.maj,isMin=mode=='min'||mode=='dor';
 const meter=piece.meter||[piece.bar==3?3:4,4],compound=meter[1]==8&&meter[0]%3==0,beatQ=compound?1.5:1,bpbQ=piece.bar,bpb=Math.round(bpbQ/beatQ),triple=bpb==3;
 const barB=triple?4:bpb,L2q=Math.ceil(piece.len/bpbQ-1e-6)*bpbQ,L2B=(L2q/bpbQ)*barB;
 const qToB=q=>{const bar=Math.floor(q/bpbQ+1e-9),pos=(q-bar*bpbQ)/beatQ;const b=triple?(pos<1?pos*2:2+(pos-1)):pos;return bar*barB+b};
 // start at the top of the piece (where its main motif is) unless reimagining, then any phrase start
 const pe=(piece.phr&&piece.phr.length?piece.phr:[piece.len]).map(qToB);
 const starts=[...new Set([0,...pe].map(ps=>{const n=piece.mel.find(m=>qToB(m[0])>=ps-1e-6);return n?Math.ceil(qToB(n[0])/barB-.01)*barB:null}).filter(x=>x!=null&&x<L2B-8))];
 const HKs=(piece.hk||[]).map(h=>Math.round(qToB(h[0])/barB)*barB).filter(x=>x>=0&&x<L2B-8),p0=HKs.length?(F>=.5?HKs[0]:HKs[Math.floor(R()*HKs.length)]):(F>=.5||starts.length<2?(starts[0]||0):H.pick(starts));
 const seq=arr=>{const out=[];for(let k=0;k<3;k++)for(const n of arr){const a=qToB(n[0])+k*L2B-p0,b=qToB(n[0]+n[1])+k*L2B-p0;if(b<0||a>64)continue;out.push([a,Math.max(.12,b-a),...n.slice(2)])}return out.sort((x,y)=>x[0]-y[0])};
 const src=seq(piece.mel),srcCh=seq(piece.chords);
 const deg=rel=>{let bd=99,bi=0;for(let k=-21;k<=35;k++){const v=12*Math.floor(k/7)+sc[mod(k,7)];const d=Math.abs(v-rel);if(d<bd){bd=d;bi=k}}return bi},fromDeg=k=>12*Math.floor(k/7)+sc[mod(k,7)];
 // ---- structural notes of the first eight bars (for fitting the harmony) ----
 const skel=[];for(let w=0;w<64;w+=1){const inW=src.filter(m=>m[0]>=w-1e-6&&m[0]<w+1-1e-6);if(!inW.length)continue;let b=inW[0],bs=-1;for(const m of inW){const v=Math.min(m[1],1)+(Math.abs(m[0]-w)<1e-6?.6:0);if(v>bs){bs=v;b=m}}skel.push({B:w,rel:b[2],w:(mod(w,4)<1e-6?2:mod(w,2)<1e-6?1.3:.8)*Math.min(1.5,b[1]+.25)})}
 // ---- chord loops: the genre's pool plus the source's own bar-level harmony ----
 const fam=PROGS[S.prog]||PROGS.pop,base=[...new Set([...(isMin?fam.min:fam.maj),...(isMin?PROGS.pop.min:PROGS.pop.maj)])];
 const parse=sym=>{const c=chord(sym,0);return{rel:c.rel,q:c.q}};
 const loops=base.map(p=>({ch:p.split(' ').map(parse),src:0}));
 {const sl=[];for(let b=0;b<4;b++){const a=b*4,e=a+4;let bc=null,bo=0;for(const x of srcCh){const ov=Math.min(e,x[0]+x[1])-Math.max(a,x[0]);if(ov>bo){bo=ov;bc=x}}if(bc){const q=['maj','m','7','dim'].includes(bc[4])?bc[4]:['maj7','add9','6'].includes(bc[4])?'maj':['m7','m9','madd9'].includes(bc[4])?'m':'maj';sl.push({rel:bc[2],q})}}
  if(sl.length==4&&new Set(sl.map(c=>c.rel)).size>=2)loops.push({ch:sl,src:1})}
 const fitLoop=(lp,rot)=>{let s=0,W=0;for(const n of skel){const c=lp.ch[mod(Math.floor(n.B/4)+rot,lp.ch.length)],ct=Q[c.q].map(x=>(c.rel+x)%12),pc=mod(n.rel,12);s+=n.w*(ct.includes(pc)?1:sc.includes(pc)?-.12:-1);W+=n.w}return W?s/W:0};
 const scored=[];for(const lp of loops)for(let rot=0;rot<lp.ch.length;rot++){if(lp.src&&rot)continue;const first=lp.ch[rot%lp.ch.length];let v=fitLoop(lp,rot)+(lp.src?1.1*F:0)+(first.rel==0?.12:0)+R()*.1;scored.push({v,ch:lp.ch.slice(rot).concat(lp.ch.slice(0,rot)),src:lp.src})}
 scored.sort((a,b)=>b.v-a.v);const pickTop=n=>{const t=scored.slice(0,n);return t[Math.min(t.length-1,Math.floor(R()*R()*t.length))]};
 const verse=pickTop(F>=.7?1:3);let lift=verse;
 if(F<.85){const alt=scored.filter(x=>x.v>verse.v-.35&&x.ch[0].rel!=verse.ch[0].rel);if(alt.length)lift=alt[0]}
 // ---- harmony by phrase: the song has sections, each with its own functional progression and cadence ----
 // verse phrases alternate an open ending (half cadence on the dominant) and a closed one (back home);
 // a contrasting phrase starts away from home; two bars of build (predominant, then the dominant of the dominant)
 // lead into the lift, which gets its own stronger progression. Chords are chosen per bar to fit the source melody.
 const liftBar=Math.round(postB/4)*4,nb=Math.ceil(bbB/4)+2,jz=['jazz','soul','lofi','bossa','gospel'].includes(S.color)||['soul','jazz','gospel'].includes(S.prog);
 const FN=mode=='dor'?{T:[[0,'m'],[3,'maj']],PD:[[5,'maj'],[2,'m'],[10,'maj']],D:[[7,'m'],[10,'maj']]}:mode=='mix'?{T:[[0,'maj'],[9,'m']],PD:[[5,'maj'],[2,'m']],D:[[10,'maj'],[7,'m']]}:
  isMin?{T:[[0,'m'],[8,'maj'],[3,'maj']],PD:[[5,'m'],[8,'maj'],[2,'dim']],D:[[7,'7'],[7,'maj'],[10,'maj']]}:{T:[[0,'maj'],[9,'m'],[4,'m']],PD:[[5,'maj'],[2,'m']],D:[[7,'maj'],[7,'7']]};
 const TPL={A:[['T','PD','D','D'],['T','T','PD','D'],['T','D','PD','D']],A2:[['T','PD','D','T'],['T','PD','PD','T'],['T','D','PD','T']],B:[['PD','T','PD','D'],['T','PD','T','D'],['PD','D','T','PD']],C:[['PD','T','D','T'],['T','D','T','PD'],['PD','D','T','T'],['T','PD','D','T']]};
 const srcBar=b=>skel.filter(n=>n.B>=b*4&&n.B<b*4+4);
 const fitC=(rel,q,notes)=>{const ct=Q[q].map(x=>(rel+x)%12);let s2=0,W=0;for(const n of notes){const pc=mod(n.rel,12);s2+=n.w*(ct.includes(pc)?1:sc.includes(pc)?-.15:-1);W+=n.w}return W?s2/W:0};
 const srcRelAt=bar=>{let bc=null,bo=0;const a=bar*4,e=a+4;for(const x of srcCh){const ov=Math.min(e,x[0]+x[1])-Math.max(a,x[0]);if(ov>bo){bo=ov;bc=x}}return bc?bc[2]:null};
 const pickFn=(fn,notes,prev,first,sb)=>{let best=null,bv=-1e9;const sr=srcRelAt(sb);for(const[rel,q]of FN[fn]){let v=fitC(rel,q,notes)+(sr!=null&&sr==rel?.55+.7*F:0)+(first&&fn=='T'&&rel==0?.6:0)+(prev&&prev.rel==rel?-.5:0)+(prev&&mod(prev.rel-rel,12)==7?.25:0)+R()*.25;if(v>bv){bv=v;best={rel,q}}}return best};
 const plan=[];let b=0,ph=0;const verseBars=Math.max(0,liftBar/4);
 while(b<verseBars){const left=verseBars-b;const kind=left<=2&&verseBars>=6?'pre':ph%4==0?'A':ph%4==1?'A2':ph%4==2?'B':'A2';
  if(kind=='pre'){for(let k=0;k<left;k++)plan.push({bar:b+k,fn:k==left-1?'D':'PD',sec:'pre'});b+=left;break}
  const tpl=H.pick(TPL[kind]),n=Math.min(4,left);for(let k=0;k<n;k++)plan.push({bar:b+k,fn:tpl[k],sec:ph==0?'verse1':'verse2',end:k==n-1});
  // a verse that runs straight into the lift ends on the dominant
  b+=n;ph++}
 if(verseBars>=6&&!plan.some(p=>p.sec=='pre')){const l=plan[plan.length-1];if(l)l.fn='D'}
 for(let k=0;b<nb;b++,k++){const tpl=TPL.C[(k>>2)%TPL.C.length==0?H.pick([0,1,2,3]):(k>>2)%4];plan.push({bar:b,fn:tpl[k%4],sec:'lift'})}
 const chords=[];let prev=null;
 for(let B=Math.floor(-ib/4)*4;B<0;B+=4){chords.push({B,rel:FN.T[0][0],bass:FN.T[0][0],q:FN.T[0][1]})}
 for(const p of plan){const srcIdx=p.sec=='lift'?(p.bar-verseBars):p.bar,notes=srcBar(mod(srcIdx,16));const c=pickFn(p.fn,notes,prev,p.bar==0||p.bar==verseBars,mod(srcIdx,16));
  // movement inside the bar: before a minor target (ii or vi) or the dominant, the second half becomes its own dominant
  const nx=plan.find(q=>q.bar==p.bar+1);let half=null;
  if(nx&&p.sec!='lift'&&H.ch(jz?.4:.22)){const tgt=FN[nx.fn][0];if(tgt&&tgt[0]!=0&&!(isMin&&tgt[0]==7)){half={rel:(tgt[0]+7)%12,q:'7'}}}
  chords.push({B:p.bar*4,rel:c.rel,bass:c.rel,q:c.q,sec:p.sec});if(half)chords.push({B:p.bar*4+2,rel:half.rel,bass:half.rel,q:half.q,sec:p.sec});prev=half||c}
 const secs=[];for(const p of plan){const l=secs[secs.length-1];if(l&&l.k==p.sec)l.B1=p.bar*4+4;else secs.push({k:p.sec,B0:p.bar*4,B1:p.bar*4+4})}
 const secAt=B=>{for(const x of secs)if(B>=x.B0-1e-6&&B<x.B1)return x.k;return B<0?'intro':'lift'};
 const chAt=B=>{let c=chords[0];for(const x of chords){if(x.B<=B+1e-6)c=x;else break}return c},ctOf=c=>Q[c.q].map(x=>(c.rel+x)%12);
 // ---- the hook: the opening motif, on an even grid, fitted to the loop ----
 const grid=compound?1/3:.5,hookLen=F>=.6?16:8;
 let hk=[];for(const m of src){if(m[0]>=hookLen-1e-6)break;const o=Math.round(m[0]/grid)*grid;if(hk.length&&Math.abs(hk[hk.length-1].o-o)<1e-6)continue;hk.push({o,rel:m[2]})}
 hk=hk.filter((n,i)=>{const nx=hk[i+1];return !nx||nx.o-n.o>=grid-1e-6});
 for(let i=0;i<hk.length;i++)hk[i].d=Math.min((hk[i+1]?hk[i+1].o:hookLen)-hk[i].o,2);
 // fewer notes when the source is busy: keep at most three per beat, preferring strong positions
 if(hk.length>hookLen*1.6){hk=hk.filter(n=>Math.abs(mod(n.o,1))<1e-6||Math.abs(mod(n.o,1)-.5)<1e-6);for(let i=0;i<hk.length;i++)hk[i].d=Math.min((hk[i+1]?hk[i+1].o:hookLen)-hk[i].o,2)}
 // ---- genre phrasing: outside folk styles the source's pitches are re-sung in the genre's own rhythm ----
 let straightOut=compound;{const nm=S.n||'',FAMR=[[/House|Techno|Deep House/,[[0,.75,1.5,2.5,3.25,4,4.75,5.5,6.5],[0,.75,1.5,2.5,3.5,4,4.5,5.25,6]]],
  [/Drum & Bass|Ambient|Chillout|Future Bass|Cinematic|Epic Drive/,[[0,1.5,3,4,5.5],[0,1,2.5,4,6]]],
  [/Synthwave|Trance|EDM|Synth-Pop/,[[0,.5,1,1.5,2.5,3,4,4.5,5,6],[0,.5,1.5,2,3,4,5,5.5,6.5]]],
  [/Funk|Soul/,[[0,.75,1.5,2.25,3,4,4.75,5.5,6.25],[.5,1.25,2,3,4,4.75,5.25,6]]],
  [/Pop|Build|Indie|Keys/,[[0,1,1.5,2.5,3.5,4,5,5.5,6.5],[0,.5,1.5,2.5,4,5,6]]]];
  const fr=F<.9&&!/Folk|Americana|Campfire|World|Chamber|Jazz|Bossa|Lo-fi/.test(nm)?FAMR.find(([r])=>r.test(nm)):null;
  if(fr&&hk.length>=3){const tp=fr[1][Math.floor(R()*fr[1].length)],tp2=fr[1][(fr[1].indexOf(tp)+1)%fr[1].length],at=o=>{let b=hk[0];for(const n of hk){if(n.o<=o+1e-6)b=n;else break}return b.rel};
   const nh=[];for(let o0=0;o0<hookLen;o0+=8){const t=(o0/8)%2?tp2:tp;for(const x of t)if(o0+x<hookLen)nh.push({o:o0+x,rel:at(o0+x)})}
   for(let i=0;i<nh.length;i++)nh[i].d=Math.max(.25,Math.min((nh[i+1]?nh[i+1].o:hookLen)-nh[i].o,2)*.92);hk=nh;straightOut=false}}
 const fitNote=(rel,B,strong)=>{const ct=ctOf(chAt(B));if(strong){if(ct.includes(mod(rel,12)))return rel;for(const dd of[1,-1,2,-2,3,-3])if(ct.includes(mod(rel+dd,12)))return rel+dd}if(sc.includes(mod(rel,12)))return rel;return fromDeg(deg(rel))};
 const place=(at,notes,ending)=>notes.map((n,i)=>{const B=at+n.o,strong=Math.abs(mod(B,2))<1e-6||n.d>=1;let rel=fitNote(n.rel,B,strong);if(ending&&i==notes.length-1){const ct=ctOf(chAt(B));let bb=rel,bd=99;for(let k=-7;k<=7;k++){const r2=rel+k;if(mod(r2,12)==0||(ct.includes(mod(r2,12))&&mod(r2-0,12)==(isMin?3:4))){if(Math.abs(k)<bd){bd=Math.abs(k);bb=r2}}}rel=bb}return{B,d:n.d,rel}});
 // the answer: the same rhythm, its second half moved by a step (sequence) and resolved
 const answer=hk.map(n=>({...n,rel:n.o>=hookLen/2?fromDeg(deg(n.rel)+(F>=.6?0:H.pick([-1,1,2]))):n.rel}));
 const mel=[];
 // in the read's pauses: the head of the hook, as an answer to the voice
 for(const[g0,g1]of gaps){if(g1-g0<.9||g0<0||g1>postB+1)continue;const at=Math.ceil(g0/grid)*grid,room=g1-at+.5,frag=hk.filter(n=>n.o+Math.min(n.d,1)<=room).slice(0,6);if(frag.length>=1)mel.push(...place(at,frag.map((n,i)=>i==frag.length-1?{...n,d:Math.max(n.d,1)}:n),true))}
 {const stp=F>=.75?1:F>=.4?1.5:2,end=Math.min(liftBar,bbB-2),busy=B=>mel.some(m=>B>=m.B-.25&&B<m.B+m.d);let last=null;for(let B=0;B<end-1e-6;B+=stp){if(busy(B)){last=null;continue}const n=src.find(m=>m[0]<=B+1e-6&&m[0]+m[1]>B+1e-6)||src.find(m=>m[0]>B&&m[0]<B+stp*.5);if(!n){last=null;continue}const rel=fitNote(n[2],B,true);if(last&&last.rel===rel&&last.B+last.d>=B-1e-6){last.d+=stp;continue}last={B,d:stp,rel,sim:1};mel.push(last)}for(const m of mel)if(m.sim)m.d=Math.min(m.d,4)}
 // the lift: statement and answer, as long as there is room before the cadence
 for(let at=liftBar,k=0;at<bbB-2-1e-6;at+=hookLen,k++){const body=(k%2?answer:hk).filter(n=>at+n.o<bbB-2-1e-6);mel.push(...place(at,body,k%2==1||at+hookLen>=bbB-2))}
 const harm=[];if(F<.95)for(const m of mel){if(m.B<liftBar||m.d<1)continue;const ct=ctOf(chAt(m.B));for(const dk of[-2,-5]){const r2=fromDeg(deg(m.rel)+dk);if(ct.includes(mod(r2,12))){harm.push({B:m.B,d:m.d,rel:r2});break}}}
 return{mel,harm,chords,bass:null,p0,chAt,barB,triple,compound:straightOut,loop:'phrases',hookLen,secs,secAt}}

/* ---------- composer: source composition + voice analysis + genre blueprint ---------- */
function compose(o){const R=rng(o.seed),H=tools(R),S=vary(o.blend?blendG(o.blend,o.seed,{style:(o.song||{}).blendStyle,avoidGenres:o.avoidGenres}):G[o.genre]||G.indie,o),A=o.A,L=o.L,ev=[],dr=[],SWEEPS=[],meta={genre:S.n};let LIFT=null;
 // source: a public-domain score, or an original progression and hook
 let piece=o.piece||null;
 const F=clamp(o.faith??(piece?.7:0),0,1);const shiftMode=!!piece&&piece.mode=='maj'&&(S.modes.min||0)>0&&(!S.modes.maj||F<.5&&R()<(.5-F)*1.1*(S.modes.min||0)/Object.values(S.modes).reduce((a,b)=>a+b,0));
 // ---- pacing: the read's syllable rate and its natural pulse (autocorrelation of its onsets) choose the tempo ----
 const acfAt=lag=>{const a=A.acf;if(!a||!a.length||lag<a[0][0]||lag>a[a.length-1][0])return 0;let i=0;while(i<a.length-2&&a[i+1][0]<lag)i++;const x=clamp((lag-a[i][0])/Math.max(1e-6,a[i+1][0]-a[i][0]),0,1);return Math.max(0,a[i][1]*(1-x)+a[i+1][1]*x)};
 const FPd=S.varied&&S.varied.source?clamp((S.varied.source.perBeat-1.1)/1.6,-1,1):0,EXG=1+(1-F)*2.1;
 const target=clamp(A.rate*H.pick([30,30,22.5,40,45,20])*(1-FPd*.12*EXG),S.bpm[0],S.bpm[1]);const tPull=26*(1+(1-F)*2.4),cPull=45*(1+(1-F)*1.6);let bestS=-1e9,bpm=target,ib=4;const tries=[];
 for(let b=(o.song&&o.song.bpm)||S.bpm[0];b<=((o.song&&o.song.bpm)||S.bpm[1]);b+=.5)for(const k of[2,4])if(k*60/b>=.7&&k*60/b<=2.9)tries.push([b,k]);
 for(const[b,k]of tries){const bl=60/b,off=k*bl;let al=0;for(const t of A.onsets)al+=Math.cos(2*Math.PI*t/bl);al/=Math.max(1,A.onsets.length);const nb=Math.floor((L-1.9-off)/(4*bl*1.03));if(nb<1)continue;const ring=L-off-nb*4*bl*1.03;const sc=-Math.abs(b-target)/tPull-Math.abs(b-(S.bpm[0]+S.bpm[1])/2)/cPull+al*1.1+1.1*acfAt(bl)+.5*acfAt(2*bl)-Math.abs(ring-2.4)*.15+R()*(1.2+(1-F)*1.6)-((o.avoidBpm||[]).some(x=>Math.abs(x-b)<4)?1.4:0);if(sc>bestS){bestS=sc;bpm=b;ib=k}}
 const bl=60/bpm,vEnd=A.len/bl,postB=Math.ceil(vEnd+.2),slow=bpm<84;
 const cpb=4;
 let bbB=Math.max(4,Math.floor((L-1.9-ib*bl)/(4*bl))*4);
 const tm=bb=>{const step=1/24,n=Math.ceil((ib+bb+12)/step)+1,T=new Float64Array(n),f=b=>1;for(let i=1;i<n;i++)T[i]=T[i-1]+bl*f((i-.5)*step)*step;return b=>{const x=b/step,i=Math.floor(x);return i<0?b*bl:i>=n-1?T[n-1]+(b-(n-1)*step)*bl*1.2:T[i]+(T[i+1]-T[i])*(x-i)}};
 let sec=tm(bbB);while(bbB>4&&sec(ib+bbB)>L-1.7){bbB-=4;sec=tm(bbB)}
 // ---- harmony: the voice's own pitches choose the key, the mode and the chords ----
 const cents=clamp(A.cents||0,-45,45),hist=A.hist||(()=>{const h=new Array(12).fill(0);h[A.pc]=1;return h})(),htot=hist.reduce((a,b)=>a+b,0)||1;
 const keyFit=(k,md)=>{const sc=SC[md],tr=md=='min'||md=='dor'?[0,3,7]:[0,4,7];let s=0;for(let p=0;p<12;p++){const r=mod(p-k,12),w=r==0?1:tr.includes(r)?.85:sc.includes(r)?.45:-1.1;s+=hist[p]/htot*w}return s};
 const hb=[];for(const[t,m,w]of(A.ph||[])){const b=Math.floor(t/bl/4);(hb[b]=hb[b]||new Array(12).fill(0))[mod(Math.round(m-cents/100),12)]+=w}
 const barFit=(pcs,h,scs)=>{if(!h)return 0;let s=0;for(let p=0;p<12;p++){if(!h[p])continue;s+=h[p]*(pcs.includes(p)?1:scs.has(p)?.15:-.9)}return s};
 let SP=null,HCELL=[];if(piece){const gaps=(A.pauses||[]).map(p=>[p.t/bl,(p.t+p.d)/bl]);SP=arrangePlan(piece,F,S,R,H,{bbB,ib,postB,vEnd,gaps},piece.mode);HCELL=[...new Set(SP.mel.filter(n=>n.B>=0&&n.B<16).map(n=>mod(Math.round(n.B*4),16)))].sort((a,b)=>a-b).slice(0,7)}
 let mode,key;
 if(piece){mode=shiftMode?'min':piece.mode;let best=-1e9;const KS=[];for(let k=0;k<12;k++){const scs=new Set(SC[mode].map(x=>(x+k)%12));let s=keyFit(k,mode)*2;for(let b=0;b<hb.length;b++){const raw=SP.chAt(b*4);s+=barFit(Q[raw.q].map(x=>(k+raw.rel+x)%12),hb[b],scs)/htot*2}KS.push([s,k]);if(s>best){best=s;key=k}}{let ok=KS.filter(x=>x[0]>=best-Math.max(.2,Math.abs(best)*.35));const AK=new Set(o.avoidKeys||[]);const f=ok.filter(x=>!AK.has(x[1]));if(f.length)ok=f;key=ok[Math.floor(R()*ok.length)][1]}}
 else{let best=-1e9;const KS=[];for(const md in S.modes)for(let k=0;k<12;k++){const s=keyFit(k,md)+.08*Math.log(S.modes[md]);KS.push([s,k,md]);if(s>best){best=s;mode=md;key=k}}let ok=KS.filter(x=>x[0]>=best-Math.max(.2,Math.abs(best)*.35));{const AK=new Set(o.avoidKeys||[]);const f=ok.filter(x=>!AK.has(x[1]));if(f.length)ok=f}const pk=ok[Math.floor(R()*ok.length)];key=pk[1];mode=pk[2]}
 if(o.song){if(o.song.key!=null)key=mod(o.song.key,12);if(o.song.mode&&!piece&&SC[o.song.mode])mode=o.song.mode}const scale=SC[mode],minorish=mode=='min'||mode=='dor';
 const fam=PROGS[S.prog]||PROGS.pop,pool=mode=='dor'?PROGS.modal.min:mode=='mix'?PROGS.modal.maj:mode=='lyd'?PROGS.ambient.maj:minorish?fam.min:fam.maj;
 let prog;{const scs=new Set(scale.map(x=>(x+key)%12)),cands=[];for(const ps of pool){const arr=ps.split(' ').map(c=>chord(c,key));for(let rot=0;rot<arr.length;rot++){let s=0;for(let b=0;b<hb.length;b++)s+=barFit(arr[mod(Math.floor(b*4/cpb)+rot,arr.length)].pcs,hb[b],scs);cands.push([s/htot+R()*.04,arr.slice(rot).concat(arr.slice(0,rot))])}}cands.sort((a,b)=>b[0]-a[0]);prog=cands[Math.min(cands.length-1,R()<.6?0:R()<.6?1:2)][1]}
 const salt=R()*97|0,ccache=new Map();
 const SCS=new Set(scale.concat(minorish?[11]:[]));const color=c=>{if(!c)return c;if(ccache.has(c))return ccache.get(c);const tbl=COLORS[S.color]||COLORS.triad,f=FAM(c.q,c.rel),opts=tbl[f]||[c.q],i0=(c.rel*7+salt)%opts.length,own=new Set(c.pcs.map(x=>mod(x-key,12))),third=mod(c.rel+(c.iv[1]||4),12);let cands=[...opts.slice(i0),...opts.slice(0,i0)];if(f=='M'&&!SCS.has(third))cands=['7','maj'];cands.push(c.q);const ok=q=>Q[q].every(x=>{const p=mod(c.rel+x,12);return SCS.has(p)||own.has(p)});const q=cands.find(ok)||c.q,bassRel=mod(c.bass-key,12);let o2=chord(c.rel+':'+q,key);if(bassRel!==c.rel&&o2.pcs.includes(c.bass))o2=chord(c.rel+':'+q+'/'+bassRel,key);ccache.set(c,o2);return o2};
 const tonicRaw=chord('0:'+(minorish?'m':'maj'),key),tonic=color(tonicRaw),cad=color((()=>{const sc=new Set(scale.map(x=>(x+key)%12)),opts=(minorish?['10:maj','7:maj','7:m','5:m','8:maj']:['7:maj','7:maj','5:maj','2:m','10:maj','7:m']).map(x=>chord(x,key)).filter(c=>c.pcs.every(p=>sc.has(p)||(minorish&&mod(p-key,12)==11)));return opts.length?H.pick(opts):chord(minorish?'7:maj':'5:maj',key)})());
 let PM=null;
 if(piece){const cache2=new Map();
  const mk=c=>{const k=c.join(',');if(cache2.has(k))return cache2.get(k);let rel=c[2],bs2=c[3],q=c[4];if(shiftMode){const lt=rel==7||rel==11,mp=x=>lt&&x==11?11:MAJ2MIN[x],pcs=Q[q].map(x=>mp((rel+x)%12)),bb=mp(bs2),id=identify(pcs,bb);rel=id[1];q=id[2];if(q=='maj7')q='maj';else if(q=='m7')q='m';else if(q=='7'&&rel!=7)q='maj';else if(q=='hdim'||q=='dim7')q='dim';const HM=[0,2,3,5,7,8,10,11];if(!Q[q].every(x=>HM.includes((rel+x)%12))){const deg=HM.includes(rel)?rel:MAJ2MIN[rel],tri=[0,2,4].map(j=>SC.min[(SC.min.indexOf(deg)+j)%7]);const id2=identify(rel==7?[7,11,2]:tri,deg);rel=id2[1];q=id2[2]}bs2=Q[q].map(x=>(rel+x)%12).includes(bb)?bb:rel}const raw2=chord(rel+':'+q+(bs2!=rel?'/'+bs2:''),key),o2=F>=.9?raw2:color(raw2);cache2.set(k,o2);return o2};
  const cd=SP.chords.slice(1).map((x,i)=>x.B-SP.chords[i].B).sort((a,b)=>a-b),fast=cd.length&&cd[cd.length>>1]<1.5;
  const at0=B=>{const c=SP.chAt(fast?Math.floor(B/2+1e-9)*2+.01:B);return mk([0,0,c.rel,c.bass??c.rel,c.q])},cadV=mk([0,0,7,7,F>=.9?'maj':'7']);
  const at=B=>{const c=at0(B);if(B>=bbB-2-1e-9&&B<bbB&&![7,5,11].includes(mod(c.root-key,12)))return cadV;return c};
  const next=B=>{if(fast){let n=(Math.floor(B/2+1e-9)+1)*2;for(let i=0;i<8&&at(n)===at(B);i++)n+=2;return n}for(const x of SP.chords)if(x.B>B+.24)return x.B;return B+4};
  PM={at,next};meta.source=(piece.composer.startsWith('Traditional \u00b7 ')?piece.title+' (traditional, '+piece.composer.slice(14)+')':piece.composer+', '+piece.title)+(shiftMode?' · recast in minor':'');meta.faith=Math.round(F*100);meta.title=piece.title;meta.pieceId=piece._i}
 const cadLen=Math.min(4,cpb);
 const cAt=B=>B>=bbB?tonic:PM?PM.at(B):B>=bbB-cadLen&&bbB-cadLen>=postB-4?cad:color(prog[mod(Math.floor(B/cpb),prog.length)]);
 const nextCh=B=>{if(PM){let n=PM.next(B);if(bbB>B+1e-9)n=Math.min(n,bbB);return n}let n=(Math.floor(B/cpb+1e-9)+1)*cpb;if(bbB-cadLen>B+1e-9)n=Math.min(n,bbB-cadLen);if(bbB>B+1e-9)n=Math.min(n,bbB);return n};
 const segs=(B0,B1)=>{const out=[];let b=B0;while(b<B1-1e-6){const e=Math.min(B1,nextCh(b));out.push({s:b,e,c:cAt(b)});b=e}return out};
 const SECB=Math.max(4,Math.round(bbB*.62/4)*4);
 const sect=B=>B<0?'intro':B<SECB?'voice':B<bbB?'post':'button';
 const vS=B=>{const a=A.smooth,h=A.actHop||.05;if(!a||!a.length||B<0||B>=vEnd)return 0;return a[Math.min(a.length-1,Math.floor(B*bl/h))]||0},vA=B=>{const a=A.act,h=A.actHop||.05;if(!a||B<0||B>=vEnd)return 0;let m=0;for(let t=B*bl-.08;t<B*bl+.35;t+=h)m=Math.max(m,a[Math.max(0,Math.floor(t/h))]||0);return m};
 const vMax=Math.max(.2,...(A.smooth||[.5]));
 const SEC=B=>SP&&SP.secAt?SP.secAt(B):(B<0?'intro':B<vEnd?'verse2':'lift'),secSpan=k=>SP&&SP.secs?SP.secs.find(x=>x.k==k):null;
 const I=B=>{if(B<0)return .56+.14*(B+ib)/ib;if(B>=bbB)return 1;const k=SEC(B),sp=secSpan(k),u=sp?clamp((B-sp.B0)/Math.max(1,sp.B1-sp.B0),0,1):0,base=k=='verse1'?.6:k=='verse2'?.67:k=='pre'?.7+.14*u:.88+.1*u;return B<vEnd?base+.08*vS(B)/vMax:base};
 const acc=(B,t)=>{const p=mod(B,4),f=mod(B,1);if(t=='flat')return p<1e-6?1:.88;return f>1e-6?(Math.abs(f-.5)<1e-6?.74:.64):p<1e-6?1:Math.abs(p-2)<1e-6?.9:.82};
 // the band: one curated lineup from the genre, then one instrument per slot
 GN=S.n||'';AVOID=o.avoidIns||{};WHY={};KEEP=o.keepIns||{};FAV=(S.fav&&S.fav.length)?new Set(S.fav):null;{const lead0=GN.split(' × ')[0];let ks=[Object.keys(G).find(k=>G[k].n==lead0)||domG(o)||o.genre||'indie'].filter(k=>GFAM[k]);if(S.parts){const ex=Object.keys(S.parts).filter(k=>GFAM[k]&&!ks.includes(k));ks=ks.concat(ex)}const fs=new Set();for(const k of ks)for(const f of(GFAM[k]||[]))fs.add(f);GFIT=fs.size?fs:null;GSIG=SIG[ks[0]]||SIG[domG(o)]||null}GPOOL=new Set([].concat(...S.bands.map(b=>[].concat(...Object.values(b))),(S.edm&&S.edm.dbl)||[]));const bandW=S.bands.map(b=>{let v=1;for(const k in b)for(const x of b[k])v*=Math.pow(.8,AVOID[x]||0);return v});let band=S.bands[S.bands.length-1];{let t=bandW.reduce((a,b)=>a+b,0)*H.rg(0,1);for(let i=0;i<S.bands.length;i++){t-=bandW[i];if(t<=0){band=S.bands[i];break}}}const roles={};const used=new Set();
 for(const rn in band){const rs=S.roles[rn];if(!rs)continue;if(rs.p!=null&&!H.ch(rs.p))continue;let pat0=rs.pat?H.pick(rs.pat):null;if(rn=='bass'&&rs.pat&&rs.pat.length>1&&/roll16|syncopated|funk|walking|wobBass/.test(pat0||'')&&R()<.6)pat0=H.pick(rs.pat);if(SP&&HCELL.length>=3&&!rs.keep&&(rn=='keys'?R()<(1-F)*.15:rn=='pulse'&&R()<(1-F)*.35))pat0='hookComp';const id=lineup(band[rn],pat0,H,used,rs.reg,rn,!!S.fm);if(!id)continue;if(!S.solo)used.add(id);const I0=INS[id];
  let lo=rs.reg[0],hi=rs.reg[1];while(lo<I0[4]&&hi+12<=I0[5]+5){lo+=12;hi+=12}while(hi>I0[5]&&lo-12>=I0[4]-5){lo-=12;hi-=12}lo=Math.max(lo,I0[4]);hi=Math.min(hi,I0[5]);if(hi-lo<12){const c=(I0[4]+I0[5])/2;lo=Math.max(I0[4],Math.round(c-7));hi=Math.min(I0[5],lo+16)}
  if(A.range&&['riff','pulse','color','counter','keys'].includes(rn)){const v0=A.range[0]-3,v1=A.range[1]+4,ov=(a,b)=>Math.max(0,Math.min(b,v1)-Math.max(a,v0)),c0=ov(lo,hi);let bs=c0,sh=0;for(const d of rn=='keys'?[-12]:[12,-12,24]){const a=lo+d,b=hi+d;if(a<I0[4]-2||b>I0[5]+2)continue;if(rn!='color'&&rn!='keys'&&(a<45||b>98))continue;if(rn=='keys'&&a<36)continue;const c=ov(a,b)+Math.abs(d)/24;if(c<bs-2){bs=c;sh=d}}lo+=sh;hi+=sh;lo=Math.max(lo,I0[4]);hi=Math.min(hi,I0[5])}
  roles[rn]={name:rn,id,kind:I0[3],reg:[lo,hi],pat:pat0,prev:null,keep:rs.keep||0,guitar:rs.guitar||I0[3]=='guitar',intro:rs.intro&&(S.arc||H.ch(.8)),enter:rs.enter&&H.ch(.85)?rs.enter:0,drift:H.g()*3}}
 if(o.ch)for(const rn in o.ch){const r=roles[rn],x=o.ch[rn];if(r&&x&&x.id&&INS[x.id]&&x.id!==r.id){const I1=INS[x.id];r.id=x.id;r.kind=I1[3];r.guitar=I1[3]=='guitar';r.reg=[Math.max(r.reg[0],I1[4]),Math.min(r.reg[1],I1[5])];if(r.reg[1]-r.reg[0]<12){const m=(I1[4]+I1[5])/2;r.reg=[Math.max(I1[4],Math.round(m-8)),Math.min(I1[5],Math.round(m+8))]}}}
 const hasDrums=(S.kits||[]).length&&H.ch(S.drumP??1)&&!(o.song&&o.song.groove=='none'),groove=hasDrums&&S.grooves.length?(o.song&&o.song.groove&&GROOVES[o.song.groove]?o.song.groove:(()=>{const G0=S.grooves.filter(g=>GROOVES[g]),four=G0.length&&G0.every(g=>(GROOVES[g].k||'').startsWith('o...o...o...o')),acoustic=!S.fm,fam=Object.keys(GROOVES).filter(g=>four?/^ff/.test(g):/^bb/.test(g)||(!acoustic||S.n&&/Lo-fi|Soul|Funk|Upbeat|Indie/.test(S.n))&&/^br/.test(g)),pool=[...G0,...G0,...fam].filter(Boolean),RG=rng((o.seed*40503^0x1f3d)>>>0);return pool.length?pool[Math.floor(RG()*pool.length)]:H.pick(S.grooves)})()):null;const GVX=groove?GVAR(GROOVES[groove],rng((o.seed*2654435761^0x5bd1)>>>0),o.song&&o.song.gvar!=null?o.song.gvar:.55):null;
 let KITS=[...(S.kits||[])];const KITFOR={};{const RK=rng((o.seed*69069^0x77aa)>>>0),EL=['tr909','tr808','tr707','dmx','sp12','linn9k','cr78','tr606'],AC=['studio','pi'],base=(S.kits||[]).filter(k=>k!='hand'&&k!='orch'&&k!='tabla'),pool=S.fm?[...base,...base,...EL]:[...base,...base,...AC];if(pool.length&&!(o.song&&o.song.kit))for(const g of['k','s','h'])if(RK()<.55){const pl=g=='k'&&S.edm&&S.edm.wall?pool.filter(x=>!['cr78','tr606','tr707'].includes(x)):pool;KITFOR[g]=pl[Math.floor(RK()*pl.length)]}}if(o.song&&o.song.kit)KITS=[o.song.kit,...KITS.filter(k=>k!==o.song.kit)];else if(KITS.length>1&&R()<.4)KITS=[KITS[1],KITS[0],...KITS.slice(2)];
 const lead=roles.lead,R1=roles.riff;
 const HARM=['keys','pulse','pad','pad2'].filter(n=>roles[n]),H1=HARM[0],H2=HARM[1];
 const gate=(r,B)=>{const st=sect(B),sk=SEC(B),wall=S.edm&&S.edm.wall&&(st=='post'||sk=='lift'||r.name=='pad'&&((S.edm.uni||{}).pad||0)>=3);if(!r.keep&&HARM.includes(r.name)&&r.name!==H1&&!wall&&(!(st=='post'||sk=='pre'||sk=='lift')||r.name!==H2))return false;if((r.name=='color'||r.name=='dbl')&&(SP&&F>=.5||st!='post'))return false;if(SP&&!r.keep&&(r.name=='riff'||r.name=='counter'))return false;if(st=='intro')return r.name===H1||r.name=='bass'||r.name=='pad';if(bbB>=48&&r.enter&&B>=0&&B<Math.min(r.enter*4,postB-4))return false;if(S.stop&&B>=postB-1&&B<postB&&r.name!='pad')return false;if(r.name=='lead'||r.name=='color')return st!='voice';if(st=='voice'&&!r.keep&&(r.name=='riff'||r.name=='counter'))return true<.5*vMax+.1;return true};
 const N=(r,B,d,m,base,x={})=>{if(!r||m==null||!x.force&&!gate(r,B))return;const st=sect(B);let v=base*I(B)*acc(B,x.acc)*(1+.04*H.g());ev.push({r,B,d,m:Math.round(m),v:clamp(v,.05,1),dt:x.dt||0,sc:x.scoop||0,mel:x.mel||0})};
 const SPREADK={brass:2.6,reed:2.6,pipe:2.4,ss:2.6,rd:2.6,tb:2.4,solo:2.4,bow:3.2,ens:3.0,guitar:1.8,pluck:1.8,harp:1.5,piano:1.0,epiano:1.0,organ:.5,mallet:.9,synpad:1.2,saw:1.0,synlead:1.0,synbrass:1.4,synth:1.0,stac:.7};
 const strum=(r,B,d,v,base,dir,spread)=>{const kf=SPREADK[r.kind]??1,sp=spread*kf;v.forEach((m,i)=>N(r,B,d,m,base*(dir>0?.92+.08*i/v.length:1-.06*i/v.length),{dt:(dir>0?i:v.length-1-i)*sp+H.rg(-3,3)}))};
 const from=r=>r.intro?-ib:0,STRUM=['D.DU.UDU','D.D.D.DU','D...D.DU'];
 const P={
  ostinato(r){const seq=H.pick([[0,1,2,1],[0,1,2,3],[0,2,1,2]]),gr=.5;for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1,span:14});r.prev=v;const cell=[...v,v[0]+12];for(let b=Math.ceil(g.s/gr-1e-9)*gr;b<g.e-1e-6;b+=gr)N(r,b,gr*1.8,cell[seq[mod(Math.round(b/gr),seq.length)]%cell.length],.5,{acc:'flat'})}},
  arp332(r){const pt=H.pick([[0,1,2,0,1,2,0,1],[0,1,2,1,2,3,2,3],[0,2,1,0,2,1,3,2]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1});r.prev=v;const cell=[...v,v[0]+12];for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const st=mod(Math.round(b*4),8);N(r,b,.45,cell[pt[st]],st==0||st==3||st==6?.6:.45,{acc:'flat'})}}},
  arp8(r){const ud=H.pick([[0,1,2,3,2,1,2,1],[0,1,2,3,2,1,2,3],[0,2,1,2,3,2,1,2]]),gr=.5;for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1});r.prev=v;const cell=[...v,v[0]+12];for(let b=Math.ceil(g.s/gr-1e-9)*gr;b<g.e-1e-6;b+=gr)N(r,b,gr*2.2,cell[ud[mod(Math.round(b/gr),ud.length)]],.52)}},
  alberti(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1});r.prev=v;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5)N(r,b,.7,v[[0,2,1,2][mod(Math.round(b*2),4)]],.5)}},
  arp16(r){const pt=H.pick([[0,2,1,2,3,2,1,2],[0,1,2,3,2,1,2,3],[0,2,3,1,2,3,0,2]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1});r.prev=v;const cell=[...v,v[0]+12];for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const st=mod(Math.round(b*4),8);N(r,b,.3,cell[pt[st]],st%2?.42:.55)}}},
  pluckPulse(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],2,r.prev,{bassCovers:1});r.prev=v;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5)N(r,b,.28,v[mod(Math.round(b*2),4)==3?1:0],mod(b,1)?.6:.45)}},
  block(r){const T=H.pick([[0,2],[0],[0,2,3]]);for(const g of segs(from(r),bbB+.01)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:19});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)T.forEach((p,i)=>{const b=bar+p;if(b<g.s-1e-6||b>=g.e-1e-6)return;const nx=bar+(T[i+1]??4);strum(r,b,Math.max(.4,(Math.min(nx,g.e)-b)*.92),v,.58,1,FEEL[r.kind].roll||10)})}},
  block24(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:17});r.prev=v;for(let b=Math.ceil(g.s);b<g.e-1e-6;b++){const p=mod(b,4);if(p==1||p==3){strum(r,b,.85,v,.6,1,9);if(H.ch(.25))strum(r,b-.25,.2,v.slice(-3),.3,1,5)}else if(p==0&&H.ch(.35))strum(r,b+.5,.4,v,.4,1,8)}}},
  pianoBallad(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,Math.max(r.reg[0],55),r.reg[1]+2,3,r.prev,{bassCovers:1});r.prev=v;const lb=near(g.c.bass,r.lb||43,36,52);r.lb=lb;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4){const ok=b=>b>=g.s-1e-6&&b<g.e-1e-6;if(ok(bar)){N(r,bar,2,lb,.6);N(r,bar,2,lb+12,.4);strum(r,bar,1.9,v,.55,1,14)}if(ok(bar+2))N(r,bar+2,1.8,lb+7>55?lb-5:lb+7,.45);for(const[p,j]of[[1,1],[1.5,2],[3,1]])if(ok(bar+p))N(r,bar+p,1.4,v[Math.min(j,v.length-1)],.38)}}},
  rootless(r){const T=[[0,1.5],[1.5,3],[0,2.5],[1.5],[0,1.5,3.5],[.5,2]];for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{rootless:1,span:14});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4){for(const p of H.pick(T)){const b=bar+p;if(b>=g.s-1e-6&&b<g.e-1e-6)strum(r,b,H.rg(.35,.9),v,.55,1,7)}}}},
  pima(r){const shp=H.pick([[0,1,2,3,2,1],[0,1,2,3,2,3],[0,2,1,3,1,2]]),step=H.pick([.5,1/3]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{lowBass:1,span:22});r.prev=v;for(let b=Math.ceil(g.s-1e-9);b<g.e-1e-6;b+=1){N(r,b,Math.min(2,g.e-b),v[0],.58);let i=1;for(let x=b+step;x<b+1-1e-6&&x<g.e-1e-6;x+=step,i++)N(r,x,1.2,v[Math.min(v.length-1,shp[i%shp.length]+1)],.4+.04*(i%3))}}},
  rasg(r){const ACC=[2,5,7,9,11];for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],5,r.prev,{lowBass:1,span:24});r.prev=v;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const i=mod(Math.round(b*2),12);if(ACC.includes(i)){const k0=H.pick([3,4,4,5]);for(let q=0;q<k0;q++){const bb=b+q*.07;if(bb<g.e-1e-6)strum(r,bb,q==k0-1?Math.min(.9,g.e-bb):.12,q%2?v.slice(-4):v,.38+.06*q+(i==11||i==2?.08:0),q%2?-1:1,4.5)}}else if(i%2==0)strum(r,b,.22,v.slice(0,3),.3,1,9)}}},
  skank(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{span:12});r.prev=v;for(let b=Math.ceil(g.s-1e-9);b<g.e-1e-6;b+=1){if(b+.5<g.e-1e-6)strum(r,b+.5,.2,v,.52,1,5);if(H.ch(.22)&&b+.75<g.e-1e-6)strum(r,b+.75,.12,v.slice(-3),.34,-1,4)}}},
  bubble(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{span:12});r.prev=v;for(let b=Math.ceil(g.s-1e-9);b<g.e-1e-6;b+=1)for(const[x,vv]of[[.25,.32],[.75,.4]])if(b+x<g.e-1e-6)strum(r,b+x,.18,v,vv,1,3)}},
  bjroll(r){const pt=H.pick([[0,2,3,0,2,3,0,3],[1,0,3,1,0,3,1,3],[0,3,2,0,3,2,0,2]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{lowBass:1,span:19});r.prev=v;for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),8);N(r,b,.6,v[Math.min(v.length-1,pt[i])],i%3==0?.5:.38)}}},
  mbiraA(r){const pt=H.pick([[0,2,1,3,0,2,1,2],[0,3,1,2,0,3,2,1]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{lowBass:1,span:19});r.prev=v;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const i=mod(Math.round(b*2),8);N(r,b,.9,v[Math.min(v.length-1,pt[i])],i%2?.4:.5)}}},
  mbiraB(r){const pt=H.pick([[3,1,2,0,3,1,2,1],[2,0,3,1,2,1,3,0]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{span:19});r.prev=v;for(let b=Math.ceil((g.s-.25)*2-1e-9)/2+.25;b<g.e-1e-6;b+=.5){if(b<g.s-1e-6)continue;const i=mod(Math.round((b-.25)*2),8);N(r,b,.8,v[Math.min(v.length-1,pt[i])],.36)}}},
  ostinato(r){const pt=H.pick([[0,2,1,2,3,2,1,2],[0,1,2,3,1,2,3,2],[0,2,3,2,1,2,3,1]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{span:17});r.prev=v;for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),8);N(r,b,.5,v[Math.min(v.length-1,pt[i])],i==0?.5:i%2?.32:.4)}}},
  panroll(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{span:12});r.prev=v;strum(r,g.s,.4,v,.48,1,8);const a=v[v.length-1],b0=v[v.length-2]??v[0];let i=0;for(let b=g.s+.5;b<g.e-.3;b+=.125,i++)N(r,b,.2,i%2?a:b0,.24+.06*Math.sin(i*.4))}},
  sparse(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:19});r.prev=v;strum(r,g.s,Math.min(4,g.e-g.s),v,.52,1,22);for(const[p,j]of[[1.5,1],[2,2],[3,1]]){const b=g.s+p;if(b<g.e-1e-6)N(r,b,2,v[Math.min(j,v.length-1)]+12,.36)}}},
  stab(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:15});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,vv]of[[0,1.6,.55],[2.5,1.2,.45]]){const b=bar+p;if(b>=g.s-1e-6&&b<g.e-1e-6)strum(r,b,d,v,vv,1,14)}}},
  pad(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],H.pick([3,4]),r.prev,{bassCovers:1,span:19});r.prev=v;v.forEach((m,i)=>N(r,g.s,g.e-g.s+.12,m,.5*(sect(g.s)=='post'?1.12:1),{dt:i*18}))}},
  strum(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],5,r.prev,{lowBass:1,span:24});r.prev=v;const pat=r.sp||(r.sp=H.pick(STRUM));for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const c=pat[mod(Math.round(b*2),8)];if(c=='.')continue;if(c=='D')strum(r,b,Math.max(.4,Math.min(g.e,b+1)-b),v,.62,1,clamp(1800/bpm,9,20));else strum(r,b,.45,v.slice(-3),.42,-1,7)}}},
  fingerpick(r){const pat=['T0','F3','T1','F2','T0','F4','T1','F3'];for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],5,r.prev,{lowBass:1,span:22});r.prev=v;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const s=pat[mod(Math.round(b*2),8)];N(r,b,s[0]=='T'?1:1.5,v[Math.min(v.length-1,+s[1])],s[0]=='T'?.6:.48)}}},
  bossaComp(r){const A0=[0,1.5,3],B0=[.5,2,3.5];for(const g of segs(from(r),bbB)){const v=voice(g.c,Math.max(r.reg[0],52),r.reg[1],4,r.prev,{span:14,bassCovers:1});r.prev=v;const bn=near(g.c.bass,r.lb||45,40,52);r.lb=bn;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4){const ok=b=>b>=g.s-1e-6&&b<g.e-1e-6;if(ok(bar))N(r,bar,1.4,bn,.55);if(ok(bar+2))N(r,bar+2,1.4,near((g.c.root+7)%12,bn,40,54),.5);for(const p of mod(bar/4,2)>=1?B0:A0){const b=bar+p;if(ok(b))strum(r,b,.42,v,.48,1,6)}}}},
  sparkle(r){for(let bar=0;bar<bbB;bar+=8){const b=bar+2,c=cAt(b),ms=[];for(let m=r.reg[0];m<=r.reg[1];m++)if([0,c.iv[1],7].some(x=>(c.root+x)%12==m%12))ms.push(m);if(ms.length){N(r,b,2,ms[ms.length>>1],.38);N(r,b+1,2,ms[Math.min(ms.length-1,(ms.length>>1)+1)],.3)}}},

  // ---- production-music parts: continuous rhythmic motion like the reference tracks ----
  strum16(r){const SP=['D.DU.UDUD.DU.UDU','D..UD.DUD..UD.DU','D.DUDUDUD.DU.UDU','D..UD.DU.UDUD.DU'];const pat=r.sp16||(r.sp16=H.pick(SP));for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],5,r.prev,{lowBass:1,span:24});r.prev=v;
    for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16),c=pat[i];if(c=='.')continue;let n=b+.25;while(n<g.e&&pat[mod(Math.round(n*4),16)]=='.')n+=.25;const d=Math.max(.2,Math.min(g.e,n)-b+.04),acc=i%4==0?(i==0?.64:.58):i%2==0?.5:.4;
     if(c=='D')strum(r,b,d,v,acc,1,clamp(1500/bpm,8,16));else strum(r,b,d*.9,v.slice(-3),acc*.85,-1,6)}}},
  chop16(r){const CH=['..x...x...x..x.x','x..x..x...x.x...','..x.x..x..x.x..x','x...x.x..x..x.x.'],pt=r.ch||(r.ch=H.pick(CH));for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{rootless:1,span:12});r.prev=v;for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16);if(pt[i]!='x')continue;strum(r,b,i%4==2?.3:.2,v,i%4==0?.6:.52,1,4)}}},
  chop16b(r){const CH=['....x.......x...','.x...x.x.x...x.x','..x..x....x..x..'],pt=r.ch||(r.ch=H.pick(CH));for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{rootless:1,span:10});r.prev=v;for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16);if(pt[i]!='x')continue;strum(r,b,.16,v.slice(-2),.5,i%2?-1:1,3)}}},
  hornStab(r){const T=H.pick([[[1.5,.35],[3.5,.6]],[[3.5,.6]],[[.5,.3],[2.5,.3],[3.5,.6]]]);for(const g of segs(0,bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{span:12});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=8)for(const[p,d]of T){const b=bar+4+p;if(b<g.s-1e-6||b>=g.e-1e-6)continue;strum(r,b,d,v,.62,1,3)}}},
  spiccato(r){const SQ=H.pick([[0,0,2,0,1,0,2,0,0,0,2,0,3,2,1,2],[0,3,2,3,0,3,2,3,0,3,2,3,1,3,2,3],[0,0,1,0,2,0,1,0,3,0,2,0,1,0,2,1]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1,span:12});r.prev=v;const cell=[v[0],v[1]??v[0]+7,v[2]??v[0]+12,v[0]+12];for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16);N(r,b,.24,cell[SQ[i]],i%4==0?.6:i%2?.4:.5,{acc:'flat'})}}},
  pianoOct(r){for(const g of segs(from(r),bbB)){const m=near(g.c.bass,r.lo||43,r.reg[0],r.reg[0]+14);r.lo=m;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const p=mod(b,4);if(p==1.5||p==3.5&&H.ch(.4))continue;N(r,b,.48,m,p<1e-6?.62:.5);N(r,b,.48,m+12,p<1e-6?.55:.44)}}},
  halfChords(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:17});r.prev=v;const lift=sect(g.s)!='voice'&&g.s>0;for(let b=Math.ceil(g.s*(lift?2:.5)-1e-9)/(lift?2:.5);b<g.e-1e-6;b+=lift?.5:2){const p=mod(b,4);strum(r,b,lift?.5:Math.min(2,g.e-b)+.1,v,p<1e-6?.6:.5,1,lift?6:14)}}},
  keys8(r){const PT=['xxxxxxxx','x.xx.xx.','x.x.xxx.','xx.x.xx.'],pt=r.k8||(r.k8=H.pick(PT));for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],3,r.prev,{bassCovers:1,span:12});r.prev=v;const lb=near(g.c.bass,r.lb||45,38,52);r.lb=lb;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const i=mod(Math.round(b*2),8);if(pt[i]!='x')continue;strum(r,b,.42,v,i==0?.56:i%2?.46:.5,1,4);if(i==0||i==4&&H.ch(.5))N(r,b,.9,lb,.5)}}},

  hookComp(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:15});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)HCELL.forEach((i,k)=>{const b=bar+i/4;if(b<g.s-1e-6||b>=g.e-1e-6)return;const nx=HCELL[k+1]??16;strum(r,b,Math.max(.22,Math.min(1.5,(nx-i)/4*.85)),v,i%4==0?.58:.5,1,6)})}},
  // ---- electronic parts ----
  saw(r){for(const g of segs(from(r),bbB)){const st=sect(g.s),n=st=='voice'?3:5,v=voice(g.c,r.reg[0],r.reg[1],n,r.prev,{bassCovers:1,span:n>3?26:17});r.prev=v;for(let b=g.s;b<g.e-1e-6;){const e=Math.min(g.e,Math.floor(b/4+1e-9)*4+4);v.forEach((m,i)=>N(r,b,e-b+.08,m,.5*(st=='post'?1.1:1),{dt:i*4}));b=e}}},
  offstab(r){for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{bassCovers:1,span:14});r.prev=v;for(let b=Math.floor(g.s)+.5;b<g.e-1e-6;b+=1){if(b<g.s-1e-6)continue;strum(r,b,.3,v,mod(b,2)>1?.56:.5,1,2)}}},
  dubstab(r){const T=H.pick([[1.5,3.5],[.5,2.75],[1.5,2.75,3.5],[.75,2.5]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],r.reg[1],4,r.prev,{rootless:1,span:12});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const p of T){const b=bar+p;if(b>=g.s-1e-6&&b<g.e-1e-6)strum(r,b,.32,v,.55,1,3)}}},
  pluck16(r){const ACC=new Set([0,3,6,8,11,14]),UD=H.pick([[0,1,2,3,4,5,4,3,2,1,2,3,4,5,4,3],[0,2,4,1,3,5,2,4,0,2,4,1,3,5,4,2],[0,1,2,3,1,2,3,4,2,3,4,5,3,4,5,4]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,r.reg[0],Math.max(r.reg[0]+12,r.reg[1]-12),3,r.prev,{bassCovers:1,span:12});r.prev=v;const cell=[...v,...v.map(x=>x+12)];for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16);if(sect(b)=='voice'&&!ACC.has(i)&&i%2)continue;N(r,b,.22,cell[UD[i]%cell.length],ACC.has(i)?.6:.42,{acc:'flat'})}}},
  gate16(r){const GP=H.pick(['x.xxx.xx.xx.x.xx','xx.xx.xx.x.xx.x.','x.x.xxx.x.xxx.x.']);for(const g of segs(from(r),bbB)){const st=sect(g.s),v=voice(g.c,r.reg[0],r.reg[1],st=='voice'?3:5,r.prev,{bassCovers:1,span:24});r.prev=v;if(st=='voice'||st=='intro'){v.forEach((m,i)=>N(r,g.s,g.e-g.s+.1,m,.45,{dt:i*10}));continue}for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16);if(GP[i]!='x')continue;let n=b+.25;while(n<g.e-1e-6&&GP[mod(Math.round(n*4),16)]=='x'&&n-b<.5)n+=.25;v.forEach(m=>N(r,b,Math.max(.12,(n-b)*.8),m,i%4==0?.56:.46,{acc:'flat'}))}}},
  chordChop(r){const CP=H.pick(['x..x..x...x..x..','x..x..x.x..x.x..','x.....x.x..x..x.']);for(const g of segs(from(r),bbB)){const st=sect(g.s),v=voice(g.c,r.reg[0],r.reg[1],st=='voice'?3:5,r.prev,{bassCovers:1,span:22});r.prev=v;if(st=='voice'||st=='intro'){for(let b=g.s;b<g.e-1e-6;){const e=Math.min(g.e,Math.floor(b/2+1e-9)*2+2);v.forEach(m=>N(r,b,e-b,m,.42));b=e}continue}for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16);if(CP[i]!='x')continue;const up=i==10||i==13;v.forEach(m=>N(r,b,.34,up&&m+12<=r.reg[1]+5?m+12:m,i==0?.6:.5,{acc:'flat'}))}}},
  pianoHouse(r){const T=H.pick([[.5,1.25,2,2.5,3.5],[0,.75,1.5,2.5,3.25],[.5,1.5,2.25,3,3.5]]);for(const g of segs(from(r),bbB)){const v=voice(g.c,Math.max(r.reg[0],55),r.reg[1]+2,4,r.prev,{bassCovers:1,span:14});r.prev=v;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)T.forEach((p,i)=>{const b=bar+p;if(b<g.s-1e-6||b>=g.e-1e-6)return;if(sect(b)=='voice'&&i%2)return;strum(r,b,.36,v,i==0?.6:.52,1,5)})}},
  acid16(r){const R2=rng((salt*7919+13)>>>0),seq=[];for(let i=0;i<16;i++){const x=R2();seq.push(x<.28?null:{deg:x<.55?0:x<.68?12:x<.8?7:x<.9?3:10,acc:R2()<.3,tie:R2()<.22})}seq[0]={deg:0,acc:true,tie:false};let pv=null;for(const g of segs(from(r),bbB)){const m0=near(g.c.root,r.lm||40,r.reg[0],r.reg[0]+11);r.lm=m0;for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),16),s0=seq[i];if(!s0){pv=null;continue}let n=m0+s0.deg;if(s0.deg==3&&!g.c.pcs.includes(mod(m0+3,12)))n=m0+(g.c.pcs.includes(mod(m0+4,12))?4:7);if(s0.deg==10&&!g.c.pcs.includes(mod(m0+10,12)))n=m0+7;const before=ev.length;N(r,b,s0.tie?.32:.2,n,s0.acc?.78:.5,{acc:'flat'});if(ev.length>before&&s0.tie&&pv!=null&&pv!==n){ev[ev.length-1].slide=pv;ev[ev.length-1].slideT=.06}pv=n}}},
  counter(r){let last=near(cAt(0).pcs[1]??cAt(0).root,58,r.reg[0],r.reg[1]);for(let b=0;b<bbB;b+=2){const c=cAt(b),ms=[];for(let m=r.reg[0];m<=r.reg[1];m++)if(c.pcs.includes(m%12))ms.push(m);ms.sort((x,y)=>Math.abs(x-last)-Math.abs(y-last));const m=ms[H.ch(.7)?0:Math.min(1,ms.length-1)];if(sect(b)!='voice'||H.ch(.65))N(r,b,2.05,m,.45,{force:1});last=m}}};
 const BP={
  whole(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||40,r.reg[0],r.reg[1]);r.lm=m;for(let b=g.s;b<g.e-1e-6;b+=4)N(r,b,Math.min(4,g.e-b)-.06,m,.66)}},
  rootFive(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||40,r.reg[0],r.reg[1]);r.lm=m;const f=m+7>r.reg[1]?m-5:m+7;for(let b=Math.ceil(g.s-1e-9);b<g.e-1e-6;b+=2)N(r,b,1.9,mod(b,4)<1e-6||b==g.s?m:f,.66)}},
  eighths(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||38,r.reg[0],r.reg[1]);r.lm=m;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const p=mod(b,4);N(r,b,.42,p==3.5&&H.ch(.35)&&m+12<=r.reg[1]?m+12:p==2.5&&H.ch(.25)?m+7:m,p<1e-6?.72:.52)}}},
  syncopated(r){const T=[[0,.75,0],[1.5,.4,0],[2.5,.4,7],[3,.4,12],[3.5,.4,-1]];for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||38,r.reg[0],r.reg[1]);r.lm=m;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,iv]of T){const b=bar+p;if(b<g.s-1e-6||b>=g.e-1e-6||(p>0&&H.ch(.2)))continue;let n=iv<0?near(cAt(nextCh(b)).bass,m,r.reg[0],r.reg[1])-1:m+iv;if(n>r.reg[1])n-=12;N(r,b,d,n,p?.55:.72)}}},
  walking(r){let m=near(cAt(0).bass,40,r.reg[0],r.reg[1]);for(let b=0;b<bbB;b++){const c=cAt(b),p=mod(b,4);let n;if(p<1e-6||cAt(b-1)!==c)n=near(c.bass,m,r.reg[0],r.reg[1]);else if(cAt(b+1)!==c||p==3){const t=near(cAt(b+1).bass,m,r.reg[0],r.reg[1]);n=t+(H.ch(.6)?(t>m?-1:1):(t>m?-2:2))}else{let best=m,bd=1e9;for(const x of c.iv.map(x=>c.root+x))for(let k=-1;k<=1;k++){const y=x+12*Math.round((m-x)/12)+12*k,d=Math.abs(y-m);if(d>0&&d<bd&&y>=r.reg[0]&&y<=r.reg[1]){bd=d;best=y}}n=best}N(r,b,.95,n,p<1e-6?.7:.58);m=n}},
  pulse8(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||38,r.reg[0],r.reg[1]);r.lm=m;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const p=mod(b,4);N(r,b,.45,(p==1.5||p==3.5)&&m+12<=r.reg[1]+5?m+12:m,p<1e-6?.7:.5)}}},
  bossaBass(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||40,r.reg[0],r.reg[1]);r.lm=m;const f=m+7>r.reg[1]?m-5:m+7;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,n]of[[0,1.4,m],[1.5,.45,f],[2,1.4,f],[3.5,.45,m]]){const b=bar+p;if(b>=g.s-1e-6&&b<g.e-1e-6)N(r,b,d,n,p?.55:.68)}}},
  lofiBass(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||38,r.reg[0],r.reg[1]);r.lm=m;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,n]of[[0,2.2,m],[2.75,.5,m+12>r.reg[1]?m:m+12],[3.25,.7,m+7>r.reg[1]?m-5:m+7]]){const b=bar+p;if(b>=g.s-1e-6&&b<g.e-1e-6)N(r,b,d,n,p?.5:.68)}}},

  funk(r){const T=H.pick([[[0,.3,0,.75],[.75,.15,0,.45],[1.5,.2,12,.6],[2,.3,0,.62],[2.75,.15,7,.5],[3,.2,10,.55],[3.5,.25,-1,.55]],[[0,.4,0,.75],[.5,.15,12,.55],[1.25,.2,0,.5],[2,.25,7,.6],[2.5,.15,0,.45],[3,.15,12,.55],[3.25,.2,10,.5],[3.75,.2,-1,.55]]]);
   for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||38,r.reg[0],r.reg[1]);r.lm=m;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,iv,vv]of T){const b=bar+p;if(b<g.s-1e-6||b>=g.e-1e-6||(p>0&&H.ch(.12)))continue;let n;if(iv<0){const t=near(cAt(nextCh(b)).bass,m,r.reg[0],r.reg[1]);n=t+(t>=m?-1:1)}else{n=m+(iv==10&&!g.c.pcs.includes(mod(m+10,12))?7:iv);if(n>r.reg[1])n-=12}N(r,b,d,n,vv)}}},
  sub808(r){const T=H.pick([[[0,1.4,0],[1.75,.5,0],[2.5,.9,0],[3.5,.45,-1]],[[0,.9,0],[.75,.5,0],[2,1.4,0],[3.5,.45,12]],[[0,2.4,0],[2.75,.5,0],[3.5,.45,-1]]]);for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||31,r.reg[0],r.reg[1]);r.lm=m;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,iv]of T){const b=bar+p;if(b<g.s-1e-6||b>=g.e-1e-6)continue;let n=iv<0?near(cAt(nextCh(b)).bass,m,r.reg[0],r.reg[1]):m+iv;if(n>r.reg[1]+5)n-=12;N(r,b,Math.min(d,g.e-b+.3),n,p?.62:.75)}}},
  octave8(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||36,r.reg[0],r.reg[1]);r.lm=m;const lift=sect(g.s)!='voice'&&g.s>0;for(let b=Math.ceil(g.s*2-1e-9)/2;b<g.e-1e-6;b+=.5){const p=mod(b,4),up=lift&&(p==1.5||p==3.5)&&m+12<=r.reg[1]+7;N(r,b,.44,up?m+12:m,p<1e-6?.72:p%1?.5:.6)}}},
  houseBass(r){const T=H.pick([[[.5,.4,0],[1.5,.4,0],[2.5,.4,12],[3.5,.35,0]],[[0,.3,0],[.5,.35,0],[1.5,.35,0],[2.5,.35,0],[3.25,.2,12],[3.5,.35,0]],[[.5,.45,0],[1.75,.25,0],[2.5,.45,0],[3.5,.3,7]]]);for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||36,r.reg[0],r.reg[1]);r.lm=m;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,iv]of T){const b=bar+p;if(b<g.s-1e-6||b>=g.e-1e-6)continue;let n=m+iv;if(n>r.reg[1]+5)n-=12;N(r,b,d,n,p%1?.62:.55)}}},
  offBass(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||36,r.reg[0],r.reg[1]);r.lm=m;for(let b=Math.floor(g.s)+.5;b<g.e-1e-6;b+=1){if(b<g.s-1e-6)continue;N(r,b,.38,m,.62)}}},
  roll16(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||36,r.reg[0],r.reg[1]);r.lm=m;for(let b=Math.ceil(g.s*4-1e-9)/4;b<g.e-1e-6;b+=.25){const i=mod(Math.round(b*4),4);if(i==0)continue;const j=mod(Math.round(b*4),16);N(r,b,.2,j==15&&m+12<=r.reg[1]+5?m+12:m,i==2?.62:.5,{acc:'flat'})}}},
  reese(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||34,r.reg[0],r.reg[1]);r.lm=m;N(r,g.s,g.e-g.s+.05,m,.66)}},
  dnbBass(r){const T=H.pick([[[0,1.4,0],[2.5,1.2,0]],[[0,.9,0],[1.5,.4,0],[2.5,1.4,0]],[[0,2.2,0],[2.75,1,0]]]);for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||33,r.reg[0],r.reg[1]);r.lm=m;for(let bar=Math.floor(g.s/4)*4;bar<g.e;bar+=4)for(const[p,d,iv]of T){const b=bar+p;if(b>=g.s-1e-6&&b<g.e-1e-6)N(r,b,Math.min(d,g.e-b+.1),m+iv,p?.6:.72)}}},
  wobBass(r){for(const g of segs(-ib,bbB)){const m=near(g.c.bass,r.lm||33,r.reg[0],r.reg[1]);r.lm=m;const st=sect(g.s),step=st=='voice'||st=='intro'?4:2;for(let b=g.s;b<g.e-1e-6;){const e=Math.min(g.e,Math.floor(b/step+1e-9)*step+step);N(r,b,e-b-.04,m,st=='voice'?.55:.7);b=e}}},
  pedal(r){const m=near(key,36,r.reg[0],r.reg[1]);for(let b=0;b<bbB;b+=8)N(r,b,Math.min(8,bbB-b)-.1,m,.62)}};
 // melody engines: lyric phrase (A A B A, stepwise, chord tones on 1 and 3) and the pentatonic hook
 const tones=(c,lo,hi)=>{const o=[];for(let m=lo;m<=hi;m++)if(c.iv.some(x=>x<12&&x!=10&&x!=11&&(c.root+x)%12==m%12))o.push(m);return o};
 const MOT=[[[0,1.5],[1.5,.5],[2,1],[3,1]],[[0,1],[1,1],[2,2]],[[0,.5],[.5,.5],[1,1],[2,2]],[[0,1.5],[1.5,.5],[2,2]],[[0,2],[2,1],[3,1]],[[0,1],[1,.5],[1.5,.5],[2,2]]],MOTB=[[[0,2],[2,2]],[[0,3],[3,1]],[[0,4]]];
 const dm=(k,lr)=>lr+12*Math.floor(k/7)+scale[mod(k,7)];
 function phrase(r,B0,B1){const lr=near(key,r.reg[0]+4,r.reg[0],r.reg[0]+11),A1=r.motA||(r.motA=H.pick(slow?MOT.slice(1):MOT)),B2=r.motB||(r.motB=H.pick(MOTB)),lo=r.reg[0],hi=r.reg[1];const degOf=m=>{let best=0,bd=99;for(let k=-7;k<21;k++){const d=Math.abs(dm(k,lr)-m);if(d<bd){bd=d;best=k}}return best};let cur=r.deg??degOf(near((key+(H.ch(.5)?4:7))%12,lo+7,lo,hi));const bars=Math.max(1,Math.floor((B1-B0)/4));
  for(let bi=0;bi<bars;bi++){const mot=(bars>=4?['A','A','B','A'][bi%4]:bi%2?'B':'A')=='B'?B2:A1,barB=B0+bi*4,peak=bi%4==2,lastBar=bi==bars-1;
   for(let i=0;i<mot.length;i++){const[o2,d0]=mot[i],B=barB+o2;if(B>=B1-.2)break;const c=cAt(B),strong=Math.abs(mod(o2,2))<1e-6,isEnd=lastBar&&i==mot.length-1,target=peak?cur+2:bi%4==3?cur-1:cur+(bi%2?-1:1)*(H.ch(.5)?1:0);
    let cands=[];for(let k=cur-4;k<=cur+4;k++){const m=dm(k,lr);if(m<lo||m>hi)continue;const pcOk=c.pcs.includes(m%12)&&tones(c,m,m).length;if((strong||isEnd)&&!pcOk)continue;const step=Math.abs(k-cur);let sc=Math.abs(k-target)*1.2+(step>1?(peak&&strong&&H.ch(.15)?1:6)*step:0)+(step==0?.6:0);if(isEnd&&![c.root,(c.root+c.iv[1])%12].includes(m%12))sc+=8;cands.push([sc+R()*.4,k])}
    if(!cands.length)for(let k=cur-5;k<=cur+5;k++){const m=dm(k,lr);if(m>=lo&&m<=hi&&tones(c,m,m).length)cands.push([Math.abs(k-cur),k])}if(!cands.length)continue;cands.sort((a,b)=>a[0]-b[0]);cur=cands[0][1];const d=Math.min(isEnd?Math.max(d0,2):d0,B1-B)*1.03;
    N(r,B,d,dm(cur,lr),.55+.15*Math.sin(Math.PI*(bi%4+o2/4)/4),{force:1,scoop:SCOOPK.has(r.kind)&&d>.9&&H.ch(.15)?H.rg(15,30):0})}}r.deg=cur}
 const PENT=minorish?[0,3,5,7,10]:[0,2,4,7,9],pm=(k,lr)=>lr+12*Math.floor(k/5)+PENT[mod(k,5)],isCT=(c,m)=>c.iv.some(x=>x<12&&x!=10&&x!=11&&(c.root+x)%12==mod(m,12));
 const CELLS=[[[0,.5],[.5,.5],[1.5,.5],[2.5,1.5]],[[.5,.5],[1,.5],[1.5,1],[3.5,1]],[[0,.75],[.75,.75],[1.5,.5],[2,.5],[3.5,1]],[[.5,.5],[1.5,.5],[2,.5],[2.5,1.5]],[[0,.5],[.75,.25],[1,.5],[2,1],[3.5,.5]],[[0,1],[1.5,.5],[2,.5],[2.5,.5],[3.5,.5]],[[.5,.25],[.75,.25],[1,.5],[1.5,.5],[2.5,1]]];
 const SHAPES=[[0,1,2,1,0],[0,1,2,3,2],[3,2,1,0,1],[0,1,0,-1,0],[0,2,1,0,-1],[2,1,0,1,2],[0,-1,0,2,1],[1,2,3,2,1]];
 const hk={cell:H.pick(slow?CELLS.slice(0,4):CELLS),A:H.pick(SHAPES)};hk.B=hk.A.map((x,i,a)=>i==a.length-1?a[0]-1:i==a.length-2?a[0]:x);
 const blueP=S.blue??.05,blue=(r,B,m)=>{if(minorish||!H.ch(blueP))return;const rl=mod(m-key,12),g=rl==4?m-1:rl==7?m-1:rl==0?m-2:null;if(g!=null)N(r,B-.1,.1,g,.32,{force:1})};
 function riff(r,B0,B1,o={}){const lr=near(key,r.reg[0]+2,r.reg[0],r.reg[0]+11),kc=Math.round(((r.reg[0]+r.reg[1])/2-2-lr)/12*5);
  for(let bar=Math.floor(B0/4)*4;bar<B1;bar+=4){const bi=mod(Math.round(bar/4),4),shape=bi%2?hk.B:hk.A,seq=bi==2?1:0;
   hk.cell.forEach(([oo,d],i)=>{const B=bar+oo;if(B<B0-1e-6||B>=B1-1e-6)return;const push=oo>=3.5,c=cAt(push?bar+4:bar);let kA=kc,bd=99;for(let k=kc-4;k<=kc+4;k++){const dd=Math.abs(k-kc)+(isCT(c,pm(k,lr))?0:9);if(dd<bd){bd=dd;kA=k}}let k=kA+shape[i%shape.length]+seq,m=pm(k,lr);
    if((d>=1||Math.abs(mod(oo,2))<1e-6||push)&&!isCT(c,m)){for(const dk of[-1,1,-2,2])if(isCT(c,pm(k+dk,lr))){k+=dk;break}m=pm(k,lr)}while(m>r.reg[1])m-=12;while(m<r.reg[0])m+=12;
    blue(r,B,m);N(r,B,Math.min(d,B1-B+.5)*.96,m,(o.v||.6)*(Math.abs(mod(oo,1)-.5)<1e-6?1.05:Math.abs(mod(oo,2))<1e-6?1:.85),{force:o.force,scoop:SCOOPK.has(r.kind)&&d>=1&&H.ch(.2)?H.rg(20,40):0})})}}
 function cascade(r,endB,up,o={}){if(!r)return;const c=o.chord||cAt(endB),lr=near(key,r.reg[0]+2,r.reg[0],r.reg[0]+11),ctr=(r.reg[0]+r.reg[1])/2;let kt=null,bd=99;for(let k=0;k<21;k++){const m=dm(k,lr);if(m>=r.reg[0]+5&&m<=r.reg[1]-5&&isCT(c,m)&&Math.abs(m-ctr)<bd){bd=Math.abs(m-ctr);kt=k}}if(kt==null)return;for(let i=0;i<4;i++)N(r,endB-1+i*.25,.26,dm(kt+(up?i-4:4-i),lr),.42+.06*i,{force:1});N(r,endB,o.d||2,dm(kt,lr),.66,{force:1})}
 function pieceLine(r,B0,B1,o={}){const st=PM.st,L2=PM.L2,ev2=[];for(let k=0;k<4;k++)for(const n of piece.mel){const Bq=(n[0]+k*L2-PM.p0)*st;if(Bq<B0-1e-6||Bq>=B1-1e-6)continue;ev2.push([Bq,n[1]*st,n[2]])}if(!ev2.length)return;
  const ms=ev2.map(e=>e[2]).sort((a,b)=>a-b),oc=12*Math.round(((r.reg[0]+r.reg[1])/2-(key+ms[ms.length>>1]))/12);
  ev2.forEach((e,i)=>{let[Bq,d,rel]=e;const c=cAt(Bq),pc=mod(rel,12),cr=mod(c.root-key,12);let m=key+rel-pc+(shiftMode?(cr==7||cr==11)&&pc==11?11:MAJ2MIN[pc]:pc)+oc;while(m>r.reg[1]+7)m-=12;while(m<r.reg[0]-7)m+=12;
   if(Math.abs(mod(Bq,2))<1e-6&&!c.pcs.includes(mod(m,12))){for(const dd of[-1,1,-2,2])if(c.pcs.includes(mod(m+dd,12))){m+=dd;break}}
   const nx=ev2[i+1],gap=nx?nx[0]-(Bq+d):0;if(nx&&gap>0&&gap<2)d+=gap*.9;
   if(Math.abs(mod(Bq,4))<1e-6&&Bq>B0+.5&&d>=1&&R()<(S.push||.3)){Bq-=.5;d+=.5}
   blue(r,Bq,m);N(r,Bq,Math.min(d,B1-Bq+.3),m,(o.v||.6)*(.88+.2*Math.sin(Math.PI*mod(Bq,8)/8)),{force:o.force,scoop:SCOOPK.has(r.kind)&&d>=1&&H.ch(.15)?H.rg(15,30):0})})}
 function tuneLine(r,notes,o={}){if(!r||!notes.length)return;const phrA=B=>{const pl=8,x=mod(B,pl)/pl;return .82+.26*Math.sin(Math.PI*x)};const inR=notes.filter(n=>n.B>=-ib-1e-6&&n.B<bbB-.25);if(!inR.length)return;const ms=inR.map(n=>n.rel).sort((a,b)=>a-b),oc=12*Math.round((clamp(o.mel==2?64:70,r.reg[0]+4,r.reg[1]-4)+(o.up||0)-(key+ms[ms.length>>1]))/12);
  for(const n of inR){const pc=mod(n.rel,12);let m=key+n.rel-pc+(shiftMode?MAJ2MIN[pc]:pc)+oc;while(m>r.reg[1]+5)m-=12;while(m<r.reg[0]-5)m+=12;const st=sect(n.B);let v=(o.v||.56)*phrA(n.B);
   if(st=='voice'){v*=n.sim?.5:.42;if(!n.sim&&vA(n.B)>.55&&n.d<2)continue}if(st=='intro')v*=.85;
   N(r,n.B,Math.min(n.d*1.06+.05,bbB-n.B+.4),m,v,{force:1,mel:o.mel||1,dt:18,scoop:r.kind=='reed'&&n.d>=1&&H.ch(.1)?H.rg(12,22):0})}}
 if(SP){const cands=[lead,R1,roles.counter,roles.color,roles.keys].filter(r=>r&&!isWind(r.id)&&INS[r.id]&&INS[r.id][4]<=72);const player=cands[0]||null;if(player){tuneLine(player,SP.mel,{v:player.kind=='piano'||player.kind=='epiano'?.48:.56});const lastM=ev.filter(e=>e.r===player&&e.mel==1&&e.B<bbB).sort((a,b)=>b.B-a.B)[0];if(lastM){const ts=[];for(let m=lastM.m-7;m<=lastM.m+7;m++)if(tonic.pcs.includes(mod(m,12)))ts.push(m);ts.sort((a,b)=>Math.abs(a-lastM.m)-Math.abs(b-lastM.m));if(ts.length)N(player,bbB,4,ts[0],.5,{force:1,mel:1,dt:0})}}
  const second=cands.find(r=>r!==player);if(player&&second&&SP.harm.length)tuneLine(second,SP.harm.filter(n=>n.B>=postB-1),{v:.4,mel:2})}
 else{if(R1){riff(R1,-ib,bbB);if(postB<bbB-1)cascade(R1,postB,H.ch(.5))}
  if(lead&&postB<bbB-2){if(S.melody=='lyric')phrase(lead,postB,bbB-1);else riff(lead,postB,bbB-1,{force:1,v:.66})}
  cascade(lead||R1,bbB,H.ch(.6),{chord:tonic,d:4})}
 // answers in the read's real silences
 const ans=SP?null:lead||R1;if(ans)for(const p of A.pauses){if(p.d<1)continue;const b0=Math.ceil(p.t/bl*2+.5)/2,b1=(p.t+p.d)/bl;if(b1-b0<1)continue;const lr=near(key,ans.reg[0]+2,ans.reg[0],ans.reg[0]+11),c=cAt(b0);let k0=Math.round(((ans.reg[0]+ans.reg[1])/2-lr)/12*5);for(let t=0;t<5&&!isCT(c,pm(k0,lr));t++)k0++;const notes=hk.cell.filter(([o2])=>o2<b1-b0-.25).slice(0,4);notes.forEach(([o2,d],i)=>{let m=pm(k0+hk.A[i%hk.A.length],lr);if(i==notes.length-1&&!isCT(c,m))m=pm(k0,lr);N(ans,b0+o2,i==notes.length-1?Math.max(d,1.2):d,m,.45,{force:1})})}
 for(const rn in roles){const r=roles[rn];if(rn=='lead'||rn=='riff'&&!(r.keep&&P[r.pat]&&r.pat!='riff'))continue;if(rn=='bass'){if(SP&&SP.bass){const oc=12*Math.round(((r.reg[0]+r.reg[1])/2-6-(key+SP.bass.map(x=>x.rel).sort((a,b)=>a-b)[SP.bass.length>>1]))/12);for(const n of SP.bass){if(n.B<0||n.B>=bbB)continue;let m=key+n.rel+oc;while(m>r.reg[1])m-=12;while(m<r.reg[0])m+=12;N(r,n.B,n.d*.98,m,mod(n.B,2)<1e-6?.7:.58)}}else(BP[r.pat]||BP.whole)(r);continue}(P[r.pat]||P.pad)(r)}
 // drums and percussion
 if(groove){const gv=GVX,al=S.alias||{},light=S.under=='light';for(let bar=-Math.ceil(ib/4)*4;bar<bbB;bar+=4){const st=sect(Math.max(bar,0));const end=st=='post'&&bar+4>=bbB&&bar>=postB;
   for(const ln in gv){const isTime=['h','sh','hp','rd','tb','cab','te','ss'].includes(ln);if(SP&&bar>=0&&SEC(bar)=='verse1'&&secSpan('verse2')&&['s','cl','s2','cjs','kf','t1'].includes(ln))continue;if(st=='voice'&&light&&!isTime&&ln!='k')continue;if(bar<0&&!['k','kf','h','sh','hp','rd','cab','tb','cl','s','ss'].includes(ln))continue;if((bbB>=48&&S.drumEnter)&&bar>=0&&bar<Math.min(S.drumEnter*4,postB-4)&&!['sh','tb'].includes(ln))continue;const s=gv[ln],nm=al[ln]||ln;
    for(let i=0;i<16;i++){const chx=s.length>16?s[mod(Math.round(bar/4),2)*16+i]:s[i];if(chx=='.')continue;const B=bar+i/4;if(B<-ib||B>=bbB)continue;if(end&&i>=8&&(ln=='s'||ln=='k'))continue;if(S.stop&&B>=postB-1&&B<postB)continue;const fillBar=S.fill&&(Math.abs(bar+4-postB)<.01||((bbB>=48&&S.drumEnter)&&Math.abs(bar+4-S.drumEnter*4)<.01)||(bar>=0&&mod(bar+4,16)<.01&&bar+4<bbB-2));if(fillBar&&i>=12&&ln!='h'&&ln!='sh'&&ln!='k'&&ln!='kf')continue;let v=chx=='o'?1:chx=='x'?.78:.3;if(isTime)v*=i%4==0?.85:i%2?.5:.66;v*=I(B)*(1+.08*H.g());if(st=='voice')v*=light&&ln=='k'?.5:.82;dr.push({n:nm,B,v})}}
   {const fillBar=S.fill&&(Math.abs(bar+4-postB)<.01||((bbB>=48&&S.drumEnter)&&Math.abs(bar+4-S.drumEnter*4)<.01)||(bar>=0&&mod(bar+4,16)<.01&&bar+4<bbB-2));if(fillBar&&!end&&!(S.stop&&Math.abs(bar+4-postB)<.01)){const big=Math.abs(bar+4-postB)<.01,F=big?[['s',.38],['s',.42],['t1',.5],['t1',.55]]:H.pick([[['s',.3],['g',0],['s',.36],['s',.42]],[['t1',.4],['t1',.45],['s',.4],['s',.5]],[['g',0],['s',.32],['g',0],['s',.45]]]);F.forEach(([n,v],k)=>{if(n!='g')dr.push({n:groove.startsWith('epic')&&n=='s'?'t1':n,B:bar+3+k*.25,v:v*I(bar+3)/.8})})}}
   if(S.stop&&Math.abs(bar+4-postB)<.01){dr.push({n:'k',B:postB-1.5,v:.9});dr.push({n:'s',B:postB-1.5,v:.8})}
   if(end&&groove!='cine'){for(let k=0;k<4;k++){const B=bar+3+k*.25;if(B<bbB)dr.push({n:['s','t2','t4','t5'][k],B,v:.32+.07*k})}}
   if(st=='post'&&mod(bar-postB,16)<.01&&bar>=postB)dr.push({n:'cr',B:bar,v:.62})}
  if(groove=='cine'&&postB<bbB-2)dr.push({n:'swell',B:postB-2,v:.7});
  if(SP&&HCELL.length>=2){const amt=.3+.55*(1-F),pr=H.pick(['ss','cb','sh','tb','clv','rd']);for(let bar=0;bar<bbB;bar+=4){const st=sect(bar);for(const i of HCELL){const B=bar+i/4;if(B>=bbB)continue;if(i%4&&R()<amt*.45)dr.push({n:al.k||'k',B,v:.42*I(B)});if(R()<amt)dr.push({n:pr,B,v:(i%4?.38:.52)*I(B)*(st=='voice'?.7:1)})}}}
  if(S.edm&&S.edm.build){const LS=secSpan('lift'),LB=Math.round((LS?LS.B0:postB)/4)*4;if(LB>=4&&LB<=bbB-4){const len=LB>=8?8:4,B0=LB-len;for(let i=dr.length-1;i>=0;i--){const d=dr[i],gp=GROUP[d.n];if(d.B>=LB-.5&&d.B<LB)dr.splice(i,1);else if(d.B>=B0&&d.B<LB&&(gp=='snare'||gp=='tom'))dr.splice(i,1)}
    const sn=al.s||'s';for(let b=B0;b<LB-.5-1e-6;){const u=(b-B0)/len;dr.push({n:u>.5&&H.ch(.3)?(al.cl||'cl'):sn,B:b,v:clamp((.28+.62*Math.pow(u,1.3))*(1-.45*vA(b)),.12,.95)});b+=u<.5?1:u<.75?.5:.25}
    dr.push({n:'up',B:LB,v:.5,align:'end',fitB:len});dr.push({n:'rev',B:LB,v:.55,align:'end'});dr.push({n:'imp',B:LB,v:.8});dr.push({n:'cr',B:LB,v:.72});if(H.ch(.5))dr.push({n:'drop',B:LB,v:.55});if(H.ch(.35))dr.push({n:'down',B:LB+.05,v:.3});
    if(S.edm.sweep)SWEEPS.push({t:'hp',B0,B1:LB,f0:20,f1:650});
    if(S.edm.riser){const rr=roles.pad2||roles.lead||roles.pad;if(rr){const tt=tones(cAt(LB),rr.reg[0],rr.reg[1]),mm=tt.length?tt[tt.length>>1]:null;if(mm!=null)ev.push({r:rr,B:B0,d:len-.05,m:mm,v:.3,dt:0,slide:mm-12,slideT:len*bl,mel:3,riser:1})}}
    LIFT=LB}}
  if(S.edm){dr.push({n:'imp',B:bbB,v:.62});if(ib>=2&&H.ch(.6))dr.push({n:'rev',B:0,v:.4,align:'end'});if(S.edm.sweep&&ib>0)SWEEPS.push({t:'lp',B0:-ib,B1:0,f0:700,f1:20000})}
  dr.push({n:al.k||'k',B:bbB,v:.9});if(S.fill||S.arc||groove=='cine')dr.push({n:H.pick(['cr','cr2']),B:bbB,v:.7});else if(gv.h||gv.rd)dr.push({n:gv.rd?'rd':'oh',B:bbB,v:.4})}
 // button: everybody lands on the tonic
 for(const rn in roles){const r=roles[rn];if(rn=='lead'||rn=='riff')continue;if(rn=='bass'){N(r,bbB,6,near(tonic.bass,r.lm||36,r.reg[0],r.reg[1]),.75,{force:1});continue}if(rn=='color'||rn=='counter'){N(r,bbB+.5,4,tones(tonic,r.reg[0],r.reg[1]).at(-1),.4,{force:1});continue}const v=voice(tonic,r.reg[0],r.reg[1]+3,r.guitar?5:4,r.prev,{bassCovers:1,span:r.guitar?24:19});strum(r,bbB,6,v,.6,1,r.guitar?18:4)}
 // layering: an octave double of the hook after the read
 const hookSrc=lead||R1;if(hookSrc&&S.n!='Lo-fi'){const dpool=(S.edm&&S.edm.dbl&&S.edm.dbl.filter(x=>INS[x]).length?S.edm.dbl.filter(x=>INS[x]):['glock','violin','vibes','cello']).filter(x=>x!==hookSrc.id&&!used.has(x));const di=fitPick(dpool.filter(fits),'dbl',H,new Set([...used,hookSrc.id]))||(dpool.filter(fits).length?H.pick(dpool.filter(fits)):hookSrc.id);const I0=INS[di],d2={name:'dbl',id:di,kind:I0[3],reg:[I0[4],I0[5]],drift:H.g()*2};let any=0;for(const e of ev.filter(e=>e.r===hookSrc&&e.B>=postB-1&&e.B<bbB+.01)){const m=e.m+12;if(m>=I0[4]&&m<=I0[5]){ev.push({...e,r:d2,m,v:e.v*.5,dt:e.dt+6});any=1}}if(any)roles.dbl=d2}
 // clarity pass: an accompaniment note a semitone from the sounding melody note (or, below middle C, from the bass) moves to the nearest chord tone or drops out
 {const mels=ev.filter(e=>e.mel==1).sort((a,b)=>a.B-b.B),bas=ev.filter(e=>e.r.name=='bass').sort((a,b)=>a.B-b.B);
  const at2=(L2,B)=>{let res=null;for(const m of L2){if(m.B>B+1e-6)break;if(m.B+m.d>B+1e-6)res=m}return res};
  const clash=(n,B,d)=>{const ms=[at2(mels,B),at2(mels,B+Math.min(d,1)*.5)];if(ms.some(m=>m&&[1,11].includes(mod(n-m.m,12))))return true;if(n<60){const b=at2(bas,B);if(b&&[1,11].includes(mod(n-b.m,12)))return true}return false};
  for(let i=ev.length-1;i>=0;i--){const e=ev[i];if(e.mel||e.r.name=='bass'||e.r.fx||e.r.name=='mech')continue;if(!clash(e.m,e.B,e.d))continue;const c=cAt(e.B);let fx=null;for(const dd of[1,-1,2,-2,3,-3,4,-4]){const n=e.m+dd;if(c.pcs.includes(mod(n,12))&&!clash(n,e.B,e.d)){fx=n;break}}if(fx!=null)e.m=fx;else ev.splice(i,1)}}
 // double-tracking: rhythm guitars get a second take on the other side (later, a few cents apart, a touch softer)
 for(const rn of['keys','pulse']){const r=roles[rn];if(S.solo||!r||!(r.guitar||r.kind=='guitar'))continue;const r2={...r,name:rn+'2',drift:(r.drift||0)+(H.ch(.5)?1:-1)*H.rg(4,8),dbl2:1};roles[rn+'2']=r2;for(const e of ev.filter(e=>e.r===r))ev.push({...e,r:r2,v:e.v*H.rg(.86,.96),dt:(e.dt||0)+H.rg(9,19)})}
 // performers: pedal and key mechanics on the Salamander grand, sliding upright bass, harp resonance, breathing winds, scoops
 const mech={name:'mech',id:'mech',kind:'perc',fx:1,drift:0};
 const grands=ev.filter(e=>e.r.id=='grand'&&e.r.name!='lead');if(grands.length){for(const g of segs(-ib,bbB))if(grands.some(e=>e.B>=g.s-.01&&e.B<g.e)){ev.push({r:{...mech,set:'pedal'},B:g.s-.08,d:.6,m:61,v:.16,dt:0});ev.push({r:{...mech,set:'pedal'},B:g.s+.06,d:.6,m:60,v:.14,dt:0})}for(const e of grands)if(R()<.22)ev.push({r:{...mech,set:'piano_rel'},B:e.B+e.d,d:.5,m:clamp(e.m,21,105),v:.12,dt:0})}
 {let pv=null;for(const e of ev.filter(e=>e.r.name=='bass').sort((a,b)=>a.B-b.B)){if(pv!=null&&Math.abs(e.m-pv)>5&&SLIDEK.has(e.r.kind))e.slide=pv;pv=e.m}}
 for(const e of ev.slice())if(e.r.kind=='harp'&&e.m>=72&&!e.sym){const c=cAt(e.B),f=e.m-7,m=c.pcs.includes(mod(f,12))?f:e.m-12;ev.push({...e,m,v:e.v*.14,d:e.d+2,dt:e.dt+4,sym:1})}
 for(const nm of['lead','dbl','counter']){const L2=ev.filter(e=>e.r.name==nm&&['reed','pipe','brass'].includes(e.r.kind)).sort((a,b)=>a.B-b.B);let run=null,last=-1e9,restUntil=-1e9;for(const e of L2){if((e.B-last)*bl>=1.2||run==null)run=e.B;if(e.B<restUntil&&e.B<bbB){e.drop=1;continue}if((e.B+e.d-run)*bl>6&&e.B<bbB-1){restUntil=e.B+1.5/bl;e.drop=1;continue}last=Math.max(last,e.B+e.d)}}
 for(let i=ev.length-1;i>=0;i--)if(ev[i].drop)ev.splice(i,1);
 // the read lives in C3-C5. when most of the arrangement crowds that band it fights the
 // voice however well it is mixed, so lift the worst offender clear of it.
 {const byR={};for(const e of ev){if(e.r.fx)continue;const q=byR[e.r.name]||(byR[e.r.name]={n:0,sum:0,r:e.r});q.n++;q.sum+=e.m}
  const tot=ev.length||1;const inBand=q=>q.mean>=48&&q.mean<=72;
  for(const k in byR)byR[k].mean=byR[k].sum/byR[k].n;
  let share=0;for(const k in byR)if(inBand(byR[k]))share+=byR[k].n/tot;
  for(let guard=0;share>.40&&guard<4;guard++){
   let best=null;for(const k in byR){const q=byR[k];if(q.moved||q.r.name=='lead'||!inBand(q))continue;if(!best||q.n>best.n)best=q}
   if(!best)break;best.moved=1;
   const ins=INS[best.r.id],lo=ins?ins[4]:0,hi=ins?ins[5]:127,sp=best.r.reg||[lo,hi];
   let dir=0;
   if(/^(bass|sub)/.test(best.r.name)){if(best.mean-12>=Math.max(lo,sp[0]-12))dir=-12}
   else if(best.mean+12<=Math.min(hi,(sp[1]||hi)+12))dir=12;
   else if(best.mean-12>=Math.max(lo,(sp[0]||lo)-12))dir=-12;
   if(!dir)continue;
   for(const e of ev)if(e.r.name===best.r.name)e.m+=dir;
   best.mean+=dir;if(!inBand(best))share-=best.n/tot}}
 {const pr={};for(const e of ev){if(e.r.fx)continue;const q=pr[e.r.name]||(pr[e.r.name]={n:0,sum:0,r:e.r});q.n++;q.sum+=e.m}
  const ks=Object.keys(pr);for(const k of ks)pr[k].mean=pr[k].sum/pr[k].n;
  ks.sort((a,b)=>pr[a].mean-pr[b].mean);
  for(let i=1;i<ks.length;i++){const lo=pr[ks[i-1]],hi=pr[ks[i]];
   if(hi.mean-lo.mean>=5||hi.r.name=='lead'&&lo.r.name=='lead')continue;
   const mv=hi.r.name=='lead'?lo:hi,dir=mv===hi?12:-12;
   if(mv.moved2||/^(bass|sub)$/.test(mv.r.name)&&dir>0)continue;
   const ins=INS[mv.r.id];if(!ins)continue;
   if(mv.mean+dir<ins[4]+1||mv.mean+dir>ins[5]-1)continue;
   for(const e of ev)if(e.r.name===mv.r.name)e.m+=dir;
   mv.mean+=dir;mv.moved2=1;ks.sort((a,b)=>pr[a].mean-pr[b].mean);i=0}}

 // ---- harmonizer, scalar ladders and gap filler -------------------------------
 // the scale is inferred from the arrangement's own pitch histogram, so every added
 // note is quantised to notes the piece already uses, plus the chord sounding under it.
 {const mo=x=>((x%12)+12)%12,H12=new Array(12).fill(0);
  for(const e of ev)H12[mo(e.m)]++;
  const tn=ev.length||1,SCA=[];for(let i=0;i<12;i++)if(H12[i]/tn>=.025)SCA.push(i);
  const okScale=p=>SCA.length<3||SCA.includes(mo(p));
  const chordOf=B=>{const c=cAt(B);return (c&&c.pcs)||[]};
  const stepDown=(from,B,limit)=>{const pcs=chordOf(B);for(let m=from;m>from-limit;m--)if(pcs.includes(mo(m)))return m;return null};
  const quiet=B=>true;
  const add=o=>ev.push(o);

  // 1. harmonizer: a second voice under the lead, nearest chord tone, never parallel,
  //    never closer than a minor third, 72% velocity, its own timing and tuning.
  const LD=ev.filter(e=>e.r.name=='lead'&&!e.r.fx&&!e.sym).sort((a,b)=>a.B-b.B);
  if(LD.length&&(o.song||{}).harm!==0){
   const reg=LD[0].r.reg||[40,90];let prev=null,prevLead=null,added=0;
   for(const e of LD){
    if(e.d<.75||e.v<.25)continue;
    if(added>LD.length*.6)break;
    let cand=stepDown(e.m-3,e.B,9);
    if(cand==null||!okScale(cand))cand=stepDown(e.m-3,e.B,13);
    if(cand==null)continue;
    const alt=stepDown(cand-1,e.B,6);
    // prefer the smaller move from the last harmony note, and refuse parallel motion
    if(prev!=null&&alt!=null&&Math.abs(alt-prev)<Math.abs(cand-prev))cand=alt;
    if(prev!=null&&prevLead!=null&&(e.m-prevLead)!==0&&(cand-prev)===(e.m-prevLead)&&Math.abs(cand-prev)>0){
      const other=stepDown(cand-1,e.B,6);if(other!=null&&e.m-other>=3)cand=other}
    const LIL=cand<48?7:cand<55?4:3;
    if(e.m-cand<LIL){let up=cand+12;if(up<e.m-3&&okScale(up))cand=up;else continue}
    if(cand<reg[0]-2)continue;
    add({...e,m:cand,v:e.v*.72,dt:(e.dt||0)+H.rg(-14,14),det:(e.det||0)+H.rg(-5,5),uni:9,pan:(e.pan||0)+(H.ch(.5)?.15:-.15),sc:Math.round((e.sc||0)*.6)});
    prev=cand;prevLead=e.m;added++}}

  // 2. scalar ladders: a short accelerating run into a wide upward leap or the first
  //    note after a rest. only into long notes, never into fast passages, and rationed
  //    to roughly one phrase in five the way a player would.
  for(const nm of['lead','dbl','counter']){
   const P2=ev.filter(e=>e.r.name==nm&&!e.r.fx&&!e.sym&&!e.uni).sort((a,b)=>a.B-b.B);
   let lastLad=-99;
   for(let i=0;i<P2.length;i++){
    const e=P2[i],pv=i?P2[i-1]:null;
    if(e.d<.75||e.B-lastLad<2.5||e.B<1)continue;
    const gap=pv?e.B-(pv.B+pv.d):9,leap=pv?e.m-pv.m:0;
    if(!(gap>=.5||leap>=5))continue;
    if(!H.ch(.45))continue;
    const room=Math.min(gap>=.5?gap*.75:.5,.75);if(room<.18)continue;
    const steps=2+(H.ch(.5)?1:0)+(H.ch(.25)?1:0);
    const pcs=chordOf(e.B);let m=e.m,tones=[];
    for(let k=0;k<steps;k++){let nx=null;
     for(let q=m-1;q>m-4;q--)if(okScale(q)&&(pcs.includes(mo(q))||SCA.includes(mo(q)))){nx=q;break}
     if(nx==null)break;tones.unshift(nx);m=nx}
    if(tones.length<2)continue;
    // spacing tightens toward the target: a human accelerates into the landing note
    const spans=[];let acc=0;
    for(let k=tones.length-1;k>=0;k--){const w=(.020+.012*(tones.length-1-k))/bl;acc+=w;spans.unshift(acc)}
    if(acc>room)continue;
    tones.forEach((p,k)=>add({r:e.r,B:e.B-spans[k],d:spans[k]-(k<tones.length-1?spans[k+1]:0)+.012/bl,
      m:p,v:clamp(e.v*(.42+.42*k/Math.max(1,tones.length-1)),.05,1),dt:(e.dt||0)+H.rg(-6,6),leg2:1,lad:1}));
    e.leg2=1;lastLad=e.B}}

  // 3. sparse-gap filler: when the lead rests for half a beat or more AND the read is
  //    quiet, a supporting part puts two or three chord tones in the hole. it never
  //    plays over the voice, and it stops the moment the lead comes back.
  if(LD.length){
   const host=ev.find(e=>['keys','riff','pulse','color'].includes(e.r.name)&&!e.r.fx);
   if(host){const hreg=host.r.reg||[55,79];let fills=0;
    for(let i=0;i<LD.length-1;i++){
     const a0=LD[i].B+LD[i].d,b0=LD[i+1].B,gap=b0-a0;
     if(gap<1.2||gap>8||fills>=4)continue;
     if(!quiet(a0+gap*.5))continue;
     if(!H.ch(.5))continue;
     const pcs=chordOf(a0+.25);if(!pcs.length)continue;
     const n2=2+(H.ch(.4)?1:0),step=Math.min(.5,(gap-.4)/n2);
     for(let k=0;k<n2;k++){const B2=a0+.3+k*step;
      if(B2+step>=b0-.15)break;
      let p=null;for(let q=hreg[0]+((hreg[1]-hreg[0])>>1)+k*2;q<hreg[1];q++)if(pcs.includes(mo(q))){p=q;break}
      if(p==null)continue;
      add({r:host.r,B:B2,d:step*.85,m:p,v:clamp(LD[i].v*.55*(1-.35*k),.05,1),dt:(host.dt||0)+H.rg(-10,10),pan:(host.pan||0)+(k%2?.34:-.34),fill:1})}
     fills++}}}
 }
 {const byR2={};for(const e of ev.filter(e=>['synlead','saw','synbrass','acid','bow','solo'].includes(e.r.kind)&&['lead','dbl','counter'].includes(e.r.name)&&!e.uni).sort((a,b)=>a.B-b.B)){
   const pe=byR2[e.r.name];if((!pe||e.B-(pe.B+pe.d)>=.5)&&e.d>=.35&&!e.sc){
    e.sc=['bow','solo'].includes(e.r.kind)?-H.rg(8,15):H.rg(20,50);e.slideT=.035+.02*R()}
   byR2[e.r.name]=e}}
 {const byRole={};for(const e of ev.filter(e=>SCOOPK.has(e.r.kind)&&(e.r.name=='lead'||e.r.name=='dbl')).sort((a,b)=>a.B-b.B)){const pe=byRole[e.r.name];if(!pe||e.B-(pe.B+pe.d)>=.5)e.sc=Math.max(e.sc||0,e.r.kind=='reed'?25:15);byRole[e.r.name]=e}}
 for(const e of ev)if(['piano','harp','epiano'].includes(e.r.kind)&&e.r.name!='lead'&&!e.r.fx&&e.B<bbB)e.d=Math.max(e.d,Math.min(4,nextCh(e.B)-e.B)+.12);
 // humanisation, the way players do it: dynamics that follow the phrase (not random volume), a lift into each new
 // section, legato lines that join (with the odd portamento slide on strings and winds), crisp short notes, and
 // timing that leans consistently per player instead of jittering at random
 {const GLIDE={bow:.35,solo:.35,reed:.3,brass:.2,pipe:.28,synlead:.32,synbrass:.15},byR=new Map();for(const e of ev){if(e.r.fx||e.drop)continue;if(!byR.has(e.r))byR.set(e.r,[]);byR.get(e.r).push(e)}
  for(const[r,L2]of byR){L2.sort((a,b)=>a.B-b.B);const gp=(GLIDE[r.kind]||0)*((o.ch&&(o.ch[r.name]||o.ch[r.name.replace(/2$/,'')])||{}).glide??1),line=['lead','counter'].includes(r.name)||L2.some(e=>e.mel);
   for(let i=0;i<L2.length;i++){const e=L2[i],nx=L2[i+1];
    if(!e.mel)e.v*=.92+.14*Math.sin(Math.PI*mod(e.B,8)/8);
    if(e.B>=postB-4&&e.B<postB)e.v*=1+.07*(e.B-(postB-4))/4;
    if(line&&nx&&nx.B-(e.B+e.d)<.2&&nx.B-e.B>=.4&&Math.abs(nx.m-e.m)<=12){e.legato=1;const iv=Math.abs(nx.m-e.m);if(gp&&iv>=1&&iv<=7&&nx.slide==null&&H.ch(gp)){nx.slide=e.m;nx.slideT=.045+.016*iv}}
    e.v=clamp(e.v,.05,1)}}}
 if(S.edm){
  if(roles.bass&&S.edm.sub&&S.edm.sub.length){const ok=S.edm.sub.filter(x=>INS[x]&&x!==roles.bass.id);if(ok.length){const id=H.pick(ok),I0=INS[id],rs={name:'sub',id,kind:I0[3],reg:[Math.max(I0[4],28),Math.min(I0[5],43)],drift:0};if(rs.reg[1]-rs.reg[0]>=10){roles.sub=rs;for(const e of ev.filter(e=>e.r===roles.bass)){let m=e.m;while(m>rs.reg[1])m-=12;while(m<rs.reg[0])m+=12;ev.push({...e,r:rs,m,v:e.v*.92,dt:0,slide:e.slide!=null?m+(e.slide-e.m):undefined})}}}}
  const UN=S.edm.uni||{};for(const rn in UN){const r=roles[rn],k=UN[rn];if(!r||k<2)continue;r.uniN=k;const sp=k>=5?22:13,gv=k>=5?.62:k>=3?.72:.8;for(const e of ev.filter(e=>e.r===r&&!e.riser)){const base={...e};e.gm=Math.pow(gv,1.6);e.uni=0;for(let j=0;j<k;j++){const x=2*j/(k-1)-1;if(Math.abs(x)<1e-6)continue;ev.push({...base,gm:Math.pow(gv,1.6),det:x*sp*(.85+.3*R()),pan:x*.78,dt:(base.dt||0)+R()*4,uni:j+1})}}}}
 const LEAN={sub:-2,lead:8,counter:5,keys:3,pad:10,pad2:12,bass:-2,pulse:0,riff:2,color:4,dbl:6},PH={},drift=(r,B)=>{const p=PH[r.name]??(PH[r.name]=(r.name.length*1.618)%6.283);return Math.sin(6.283*B/7+p)+.6*Math.sin(6.283*B/3.1+2*p)};
 // timing: genre swing, rubato tempo map, per-player feel, micro-timing
 const sw=(o.song&&o.song.sw!=null?o.song.sw:(S.sw||0)*H.rg(.7,1.15)),sw16=(S.sw16||0)*H.rg(.8,1.15),swing=B=>{const f=mod(B,1);if(Math.abs(f-.5)<1e-6)return B+sw/6;if(sw16&&(Math.abs(f-.25)<1e-6||Math.abs(f-.75)<1e-6))return B+sw16/12;return B},lagMul=S.lag||1;

 // ---- performance: phrasing, groove feel, articulation, pedal, slides, fills — shaped per genre, per song and per instrument ----
 {const SGp=o.song||{},PF=SGp.feel??1,PR=rng((o.seed^0x9e11)>>>0),hs=x=>{let h=2166136261;for(const ch of String(x))h=Math.imul(h^ch.charCodeAt(0),16777619);return((h>>>0)%1000)/1000};
  const FH=(S.feelFrom&&G[S.feelFrom]&&G[S.feelFrom].feelHint)||S.feelHint;const FN=S.feelFrom&&G[S.feelFrom]?G[S.feelFrom].n:GN;const fam=FH?FH:/Classical Guitar|Cello Solo|East Asian|Nordic|Church|Glass/.test(FN)?'rubato':/Spanish|Steel Pan|Mbira|Marimba|Celtic/.test(FN)?'lilt':/Reggae/.test(FN)?'laid':/Bluegrass|Baroque/.test(FN)?'push':/House|Techno|Trance|EDM|Future|Synthwave|Synth-Pop|Drum & Bass/.test(FN)?'tight':/Soul|Lo-fi|Jazz|Funk|Chillout/.test(FN)?'laid':/Bossa|Folk|Americana|Campfire|World/.test(FN)?'lilt':/Cinematic|Chamber|Ambient|Epic/.test(FN)?'rubato':'push';
  const PH=PR()<.5?8:16,ARC=(.06+.1*PR())*PF,ACC={tight:[.1,-.04,.05,-.04],laid:[.05,-.02,.08,-.03],lilt:[.08,-.05,.03,-.02],rubato:[.04,0,.02,0],push:[.08,-.03,.06,-.02]}[fam];
  const FT={tight:{drums:[0,-2,-1,-2],bass:[0,0,0,0],keys:[1,0,1,0]},laid:{drums:[0,6,3,8],bass:[6,8,6,8],keys:[9,10,8,10],snare:14},lilt:{drums:[0,4,-2,6],bass:[2,3,2,3],keys:[4,6,3,6]},rubato:{drums:[0,0,0,0],bass:[4,4,4,4],keys:[8,8,8,8]},push:{drums:[-3,-5,-4,-6],bass:[-2,-2,-2,-2],keys:[0,-2,0,-2],snare:-2}}[fam],FS=(.6+.8*PR())*PF;
  const slot=B=>{const f=((B%1)+1)%1;return f<.125?0:f<.375?1:f<.625?2:3};
  const LO=new Uint8Array(Math.ceil((bbB+ib+24)*4)+8);for(const e of ev)if(e.r&&/^lead/.test(e.r.name)&&e.m!=null)for(let q=Math.max(0,Math.floor((e.B+ib)*4));q<(e.B+ib+e.d)*4&&q<LO.length;q++)LO[q]=1;
  const byR=new Map();for(const e of ev)if(e.r&&!e.r.fx&&e.m!=null){if(!byR.has(e.r))byR.set(e.r,[]);byR.get(e.r).push(e)}for(const a of byR.values())a.sort((x,y)=>x.B-y.B);
  for(const[r,arr]of byR){const nm=r.name.replace(/2$/,''),k=r.kind,ih=hs(r.id+nm+o.seed),legK=['bow','solo','ens','synpad','synlead','pad'].includes(k),pno=['piano','epiano'].includes(k)&&/^(keys|pulse)/.test(r.name)&&ih>.2,tb=/bass|sub/.test(nm)?FT.bass:FT.keys;
   for(let i=0;i<arr.length;i++){const e=arr[i],nx=arr[i+1],pb=(((e.B%PH)+PH)%PH)/PH,on=Math.abs(e.B-Math.round(e.B))<1e-6,bp=((Math.floor(e.B)%4)+4)%4;
    let m=1+ARC*(.6+.8*ih)*(Math.sin(Math.PI*Math.pow(pb,.8))-.4);m+=on?ACC[bp]*(.5+ih):-.03*(.5+ih);
    const sc=sect(e.B);m*=sc=='intro'?.9:sc=='post'?1.05:sc=='button'?1.08:1;
    if(/^(keys|pulse|riff|color)$/.test(nm))m*=LO[Math.floor((e.B+ib)*4)]?.9:1.04;
    if(/^(lead|counter)$/.test(nm)&&arr[i-1]&&nx&&e.m>arr[i-1].m&&e.m>=nx.m)m*=1.06;
    if(!nx||nx.B-(e.B+e.d)>.7){m*=.93;e.d*=.92}
    e.v=clamp(e.v*m,.05,1);e.dt=(e.dt||0)+tb[slot(e.B)]*FS*(.7+.6*ih);
    if(legK&&nx&&nx.B>e.B&&nx.B<=e.B+e.d+.15){e.d=Math.max(e.d,nx.B-e.B+.04);nx.leg2=1;e.leg2=e.leg2||0;if(['bow','solo','synlead'].includes(k)&&Math.abs(nx.m-e.m)<=7&&nx.m!==e.m&&nx.slide==null&&PR()<.3*(.6+ih)*PF){nx.slide=e.m;nx.slideT=.06+.07*PR()}}
    else if(/^(pulse|keys)$/.test(nm)&&!pno&&!legK)e.d*=.82+.25*ih;
    if(pno){const c0=cAt(e.B);let t2=e.B+e.d;while(t2<e.B+4&&cAt(t2)===c0)t2+=.25;e.d=Math.max(e.d,t2-e.B-.04);e.ped=1}
    if(/^bass/.test(nm)&&!/syn|acid/.test(k)&&on&&e.d>=.75&&e.slide==null&&PR()<.12*(.5+ih)){e.slide=e.m-(PR()<.5?1:2);e.slideT=.05+.04*PR()}}}
  for(const d of dr){const g=GROUP[d.n];if(g=='fx')continue;d.dt=(d.dt||0)+(FT.drums[slot(d.B)]+(g=='snare'?(FT.snare||0):0))*FS;if(Math.abs(d.B-Math.round(d.B))<1e-6)d.v=clamp((d.v||.8)*(1+ACC[((Math.floor(d.B)%4)+4)%4]*.6),.05,1)}
  if(dr.length&&bbB>4&&fam!='rubato'&&PR()<.75&&!dr.some(d=>GROUP[d.n]=='fx'&&d.B>bbB-2&&d.B<bbB)){const pat=PR()<.5?[-1,-.75,-.5,-.25]:[-.5,-.25],tn=['t1','t3','t5'];pat.forEach((x,i)=>dr.push({n:PR()<.55?tn[Math.min(2,i)]:'s',B:bbB+x,v:.5+.12*i}))}
  if(fam=='rubato'){const RA=(/Cello|Classical|Spanish/.test(GN)?95:60)*PF,ru=B=>{const pb=(((B%PH)+PH)%PH)/PH;return RA*(-.5*Math.sin(Math.PI*pb)+(pb>.8?Math.pow((pb-.8)/.2,2):0))};for(const e of ev)if(e.r&&!e.r.fx)e.dt=(e.dt||0)+ru(e.B);for(const d of dr)if(GROUP[d.n]!='fx')d.dt=(d.dt||0)+ru(d.B)}
  meta.feel={family:fam,phrase:PH,arc:+ARC.toFixed(3),timing:+FS.toFixed(2)}}
 if(S.penta){const P5=new Set((mode=='min'?[0,3,5,7,10]:[0,2,4,7,9]).map(x=>(x+key)%12));for(const e of ev){if(e.m==null||!e.r||e.r.fx||/bass|sub/.test(e.r.name))continue;if(!P5.has(mod(e.m,12))){for(const d of[-1,1,-2,2])if(P5.has(mod(e.m+d,12))){e.m+=d;break}}}}
 // ---- room for the voice: a cap on parts, and counter/double parts thin out under the voice (both adjustable) ----
 {const SG=o.song||{},maxP=SG.maxParts??7,thin=SG.thin??1;const have=[...new Set(ev.filter(e=>e.r&&!e.r.fx).map(e=>e.r.name.replace(/2$/,'')))],drop=new Set();for(const d of['counter','color','riff','dbl','pulse'])if(have.length-drop.size>maxP&&have.includes(d))drop.add(d);
  for(let i=ev.length-1;i>=0;i--){const e=ev[i];if(!e.r||e.r.fx)continue;const nm=e.r.name.replace(/2$/,'');if(drop.has(nm))ev.splice(i,1);else if(thin&&/^(counter|dbl)$/.test(nm)&&vA(e.B)>.25&&(e.d<1||Math.round(e.B)%2))ev.splice(i,1)}meta.voiceRoom={dropped:[...drop]}}
 // ---- no mosquitoes: sustained or buzzy sounds (bowed/solo strings, synths, electric piano, pads) stay out of the shrill top octave;
 //      piano, guitar, mallets and harp keep their sparkle up high ----
 {const SGt=(o.song||{}).tame??1,SGo=(o.song||{}).tameAt??0;const BUZZ=new Set(['bow','solo','ens','pizz','synlead','synthpluck','synth','saw','synbrass','synpad','acid','epiano','stac','pad']);let moved=0;
  for(const e of ev){if(e.m==null||!e.r||e.r.fx)continue;const nm=e.r.name.replace(/2$/,''),ux=o.ch&&(o.ch[e.r.name]||o.ch[nm]);if(ux&&ux.oct)e.m+=12*ux.oct;if(!SGt||(ux&&ux.oct>0)||/bass|sub/.test(nm))continue;const bz=BUZZ.has(e.r.kind),cap=(bz?(nm=='lead'||nm=='counter'?79:nm=='color'||nm=='riff'||nm=='dbl'?81:76):(nm=='lead'||nm=='counter'?86:nm=='color'||nm=='riff'||nm=='dbl'?91:86))+SGo;while(e.m>cap){e.m-=12;moved++}}meta.lowered=moved}
 // ---- harmonic clean-up: nothing rubs against the chord underneath it ----
 if((o.song||{}).harm??1){const HF={moved:0,trimmed:0},cid=c=>c?c.pcs.join(','):'',isRub=(pc,c)=>!!c&&!c.pcs.includes(pc)&&c.pcs.some(q=>mod(pc-q,12)==1),near=(m,c)=>{for(const dd of[-1,1,-2,2,-3,3])if(c.pcs.includes(mod(m+dd,12)))return m+dd;return m},scs=new Set((SC[mode]||SC.maj).map(x=>(x+key)%12));
  for(const e of ev){if(e.m==null||!e.r||e.r.fx)continue;const c0=cAt(e.B);if(!c0)continue;const strong=Math.abs(e.B-Math.round(e.B))<1e-6,mel=/^(lead|dbl|counter|riff)/.test(e.r.name),low=/bass|sub/.test(e.r.name);
   // a held note, or one on the beat, sitting a half step above a chord tone moves to the nearest chord tone
   if(isRub(mod(e.m,12),c0)&&(e.d>=.5||strong)&&!(low&&e.d<1)){e.m=near(e.m,c0);HF.moved++}
   // a note still sounding when the chord changes stops there if it clashes with the new chord
   const pc=mod(e.m,12);for(let t=Math.ceil((e.B+.01)*4)/4;t<e.B+e.d-.124;t+=.25){const c1=cAt(t);if(c1&&cid(c1)!==cid(c0)){const bad=mel?(isRub(pc,c1)||!scs.has(pc)):!c1.pcs.includes(pc)&&(isRub(pc,c1)||!low);if(bad){e.d=Math.max(.25,t-e.B-.02);HF.trimmed++}break}}}
  meta.harmonyFixes=HF}
 const UXc=n=>o.ch&&(o.ch[n]||o.ch[n.replace(/2$/,'')])||{};const notes=ev.map(e=>{const ux=UXc(e.r.name);if(ux.dyn!=null&&ux.dyn!=1)e={...e,v:clamp(.55+(e.v-.55)*ux.dyn,.05,1)};const f=FEEL[e.r.kind]||FEEL.piano,b=swing(e.B)+ib,t=sec(b)+((f.lag*lagMul)+(ux.lean??(LEAN[e.r.name]||0))+f.jit*(ux.jit??1)*(.45*drift(e.r,e.B)+.35*H.g()))/1000+e.dt*(ux.strum??1)/1000,te=sec(b+Math.max(.05,e.d));let dur=te-sec(b);if(e.legato)dur+=.045;else if(e.d<=.5&&!e.r.fx)dur*=.86;if(ux.len!=null)dur*=ux.len;return{...e,t:Math.max(0,t),dur:Math.max(.05,dur)}}).filter(n=>n.t<L);
 const hits=dr.map(d=>{const b=swing(d.B)+ib,ddt=(d.dt||0)/1000,j=GROUP[d.n]=='kick'?3:GROUP[d.n]=='snare'?5:6,lg=(GROUP[d.n]=='snare'?7:GROUP[d.n]=='hat'?2:0)*lagMul;return{...d,t:Math.max(0,sec(b)+(lg+H.g()*j)/1000+ddt),fitT:d.fitB?sec(b)-sec(b-d.fitB):0}}).filter(d=>d.t<L);
 const seen=[];for(const c of segs(0,bbB).map(g=>g.c))if(!seen.includes(c.name)&&seen.length<8)seen.push(c.name);
 {const scs=new Set(scale.map(x=>(x+key)%12));let ct=0,sct=0,tot=0;for(const[t,m,w]of(A.ph||[])){const pc=mod(Math.round(m-cents/100),12),c=cAt(t/bl);tot+=w;if(c&&c.pcs.includes(pc))ct+=w;else if(scs.has(pc))sct+=w}
  meta.fit={note:NOTE[mod(Math.round(A.midi||60),12)]+(Math.floor(Math.round(A.midi||60)/12)-1),cents:Math.round(cents),chordTone:tot?Math.round(ct/tot*100):0,inKey:tot?Math.round((ct+sct)/tot*100):0}}
 meta.key=NOTE[key]+' '+MODEN[mode];meta.bpm=Math.round(bpm*10)/10;meta.chords=seen.join(' · ');meta.style=S.n;meta.offset=ib*bl;meta.button=sec(ib+bbB);
 meta.lineup=Object.values(roles).filter(r=>r.name!='dbl'&&!r.dbl2).map(r=>INS[r.id][0]);if(groove)meta.lineup.push(({tr909:'Roland TR-909',tr707:'Roland TR-707',dmx:'Oberheim DMX',sp12:'E-mu SP-12',linn9k:'Linn 9000',cr78:'Roland CR-78',tr606:'Roland TR-606',tr808:'Roland TR-808',hand:'hand percussion',pi:'acoustic kit',studio:'studio kit',orch:'orchestral percussion',tabla:'tabla'})[KITS[0]]||'drums');
 {const per={};for(const e of ev){const k=e.r.name+(e.uni?'*':'');per[k]=(per[k]||0)+1}const lanes={};for(const d of dr)lanes[d.n]=(lanes[d.n]||0)+1;meta.detail={seed:o.seed,faith:+F.toFixed(2),genreMix:o.blend||o.genre,styleSource:{harmony:S.harmonyFrom,drums:S.drumsFrom,parts:S.parts},piece:piece?{title:piece.title,composer:piece.composer,mode:piece.mode,id:piece._i,hooks:piece.hk||null}:null,shiftMode:!!(typeof shiftMode!='undefined'&&shiftMode),key:NOTE[key],keyPc:key,mode,bpm:+bpm.toFixed(2),slots:S.slots||null,varied:S.varied||null,variety:(o.song||{}).variety??1,introBeats:ib,voiceEndBeat:+vEnd.toFixed(2),liftBeat:LIFT,finalBeat:bbB,sections:SP?SP.secs:null,hookStart:SP?SP.p0:null,hookLen:SP?SP.hookLen:null,hookRhythm:HCELL,chordsPerBar:cpb,chords:segs(0,bbB).map(g=>[+g.s.toFixed(2),g.c.name]),roles:Object.fromEntries(Object.values(roles).map(r=>[r.name,{id:r.id,why:WHY[r.name]||WHY[r.name.replace(/2$/,'')]||(r.name=='dbl'?{source:'octave double pool'}:r.name=='sub'?{source:'genre sub list'}:null),instrument:INS[r.id]?INS[r.id][0]:r.id,kind:r.kind,pattern:r.pat||null,register:r.reg,intro:!!r.intro,enter:r.enter||0,unison:r.uniN||1}])),noteCounts:per,groove,grooveLanes:GVX,kits:KITS,kitPerPiece:KITFOR,drumHitCounts:lanes,sweeps:SWEEPS,edm:S.edm||null,pump:S.pump||0,swing:+sw.toFixed(3),swing16:S.sw16||0,melodyStyle:S.melody,progressionFamily:S.prog,chordColor:S.color}}
 meta.song={key,mode,bpm:Math.round(bpm*10)/10,sw:+sw.toFixed(2),groove:groove||'none',gvar:o.song&&o.song.gvar!=null?o.song.gvar:.55,kit:KITS[0]||''};return{notes,hits,roles,meta,offset:ib*bl,S,bpm,key,kits:KITS,kitFor:KITFOR,sweeps:SWEEPS,liftT:LIFT!=null?sec(LIFT+ib):null,wobRate:H.pick([1,.5,2/3]),_cAt:cAt,_ev:ev}}

/* ---------- renderer: per-instrument channel strips, shared spaces, genre master ---------- */
const IRC={};
function ir(type,len){const k=type+'|'+len;if(IRC[k])return IRC[k];const sr=44100,n=Math.ceil(sr*len),b=new AudioBuffer({numberOfChannels:2,length:n,sampleRate:sr}),R=rng(type.length*131+Math.round(len*100));
 const cfg={room:{pre:.006,er:14,erSpread:.07,dec:6.2,col:.42},hall:{pre:.022,er:18,erSpread:.12,dec:5.8,col:.45},chamber:{pre:.012,er:12,erSpread:.05,dec:6,col:.5},plate:{pre:.002,er:0,dec:5.2,col:.12},gated:{pre:.003,er:10,erSpread:.03,dec:1.4,col:.18},spring:{pre:.01,er:0,dec:5,col:.3}}[type]||{pre:.01,er:10,dec:6,col:.4};
 const com=new Float32Array(n);{let lp=0;const p0=sr*cfg.pre|0;for(let i=p0;i<n;i++){const q=(i-p0)/(n-p0);lp+=((R()*2-1)-lp)*(.5-cfg.col*q);com[i]=lp*Math.exp(-cfg.dec*q)*.9}}
 for(let c=0;c<2;c++){const d=b.getChannelData(c),p0=sr*cfg.pre|0;for(let j=0;j<cfg.er;j++){const at=p0+(sr*(.004+R()*cfg.erSpread*(1+j/7))|0);if(at<n)d[at]+=(R()<.5?-1:1)*(.55-.03*j)}
  let lp=0;for(let i=p0;i<n;i++){const q=(i-p0)/(n-p0);lp+=((R()*2-1)-lp)*(.5-cfg.col*q);d[i]+=lp*Math.exp(-cfg.dec*q)*.9*.62+com[i]*.55}
  if(type=='gated'){const g0=Math.round(sr*.26),g1=Math.round(sr*.285);for(let i=g0;i<n;i++)d[i]*=i<g1?1-(i-g0)/(g1-g0):0}
  if(type=='spring'){const per=Math.round(sr*.031);for(let i=per;i<n;i++)d[i]+=d[i-per]*.38*(1-i/n)}}
 return IRC[k]=b}
const TGT=[-9.4,-2.3,-.6,-4.3,-5.4,-5.3,-6.4,-9.9,-12,-15.3,-16.6,-18.9,-20.8,-25],BANDS=[31,50,80,125,200,315,500,800,1250,2000,3150,5000,8000,12500];
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const k=i+j+len/2,tr=re[k]*cr-im[k]*ci,ti=re[k]*ci+im[k]*cr;re[k]=re[i+j]-tr;im[k]=im[i+j]-ti;re[i+j]+=tr;im[i+j]+=ti;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}}
function bandsOf(buf){const a=buf.getChannelData(0),b=buf.getChannelData(1),N=8192,sr=buf.sampleRate,acc=new Float64Array(BANDS.length);for(let s=0;s+N<a.length;s+=N*2){const re=new Float64Array(N),im=new Float64Array(N);for(let i=0;i<N;i++)re[i]=(a[s+i]+b[s+i])*.5*(.5-.5*Math.cos(2*Math.PI*i/N));fft(re,im);for(let k=1;k<N/2;k++){const f=k*sr/N;for(let j=0;j<BANDS.length;j++)if(f>=BANDS[j]/Math.SQRT2&&f<BANDS[j]*Math.SQRT2){acc[j]+=re[k]*re[k]+im[k]*im[k];break}}}return[...acc].map(x=>10*Math.log10(x+1e-12))}
async function master(buf,M2){{const hz=M2.subHz??30;if(hz>0){const sr1=buf.sampleRate,w1=2*Math.PI*hz/sr1,q1=Math.sin(w1)/(2*.7071),c1=Math.cos(w1),d0=1+q1,bb0=(1+c1)/2/d0,bb1=-(1+c1)/d0,aa1=-2*c1/d0,aa2=(1-q1)/d0;
  for(let ch=0;ch<2;ch++){const x=buf.getChannelData(ch);for(let pass=0;pass<2;pass++){let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=x[i],y=bb0*v+bb1*x1+bb0*x2-aa1*y1-aa2*y2;x2=x1;x1=v;y2=y1;y1=y;x[i]=y}}}}}
 {const a=buf.getChannelData(0),b=buf.getChannelData(1),sr0=buf.sampleRate,w0=2*Math.PI*Math.max(20,M2.monoHz||20)/sr0,al0=Math.sin(w0)/(2*.7071),cw=Math.cos(w0),a0=1+al0,B0=(1+cw)/2/a0,B1=-(1+cw)/a0,A1=-2*cw/a0,A2=(1-al0)/a0,n0=a.length,d=new Float32Array(n0);for(let i=0;i<n0;i++)d[i]=(a[i]-b[i])/2;for(let pass=0;pass<(M2.monoHz?2:0);pass++){let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<n0;i++){const x=d[i],y=B0*x+B1*x1+B0*x2-A1*y1-A2*y2;x2=x1;x1=x;y2=y1;y1=y;d[i]=y}}for(let i=0;i<n0;i++){const m=(a[i]+b[i])/2;a[i]=m+d[i];b[i]=m-d[i]}}
 {const a=buf.getChannelData(0),b=buf.getChannelData(1),sr=buf.sampleRate,W=sr,nb=Math.ceil(a.length/W),em=new Float64Array(nb),es=new Float64Array(nb),lim=M2.sideMax??-4.5;let pm=0,pd=0,hm=0,hd=0;const al=Math.exp(-2*Math.PI*150/sr);for(let i=0;i<a.length;i++){const m=a[i]+b[i],d=a[i]-b[i];hm=al*(hm+m-pm);hd=al*(hd+d-pd);pm=m;pd=d;const k=i/W|0;em[k]+=hm*hm;es[k]+=hd*hd}
  const kb=new Float64Array(nb);for(let k=0;k<nb;k++){const lo=Math.max(0,k-1),hi=Math.min(nb-1,k+1);let m=0,d=0;for(let q=lo;q<=hi;q++){m+=em[q];d+=es[q]}const r=10*Math.log10(d/Math.max(1e-12,m)+1e-12);kb[k]=r>lim?10**((lim-r)/20):1}
  for(let i=0;i<a.length;i++){const x=i/W-.5,k0=Math.max(0,Math.min(nb-1,Math.floor(x))),k1=Math.min(nb-1,k0+1),f=Math.max(0,Math.min(1,x-k0)),k=kb[k0]*(1-f)+kb[k1]*f;if(k<1){const m=(a[i]+b[i])/2,d=(a[i]-b[i])/2*k;a[i]=m+d;b[i]=m-d}}}
 const E=bandsOf(buf),tg=TGT.map((v,j)=>v+(M2.tilt||0)*Math.log2(BANDS[j]/1000)),ref=v=>(v[4]+v[5]+v[6]+v[7]+v[8]+v[9])/6,er=ref(E),tr=ref(tg);
 const corr=BANDS.map((_,j)=>{const mine=E[j]-er,want=tg[j]-tr;let c=clamp((want-mine)*(j<=3?.85:.7),j<=3?-20:-6,5);if(j<=1)c=Math.min(c,2);if(mine<want-20)c=Math.min(c,0);if(M2.lp&&BANDS[j]>M2.lp)c=Math.min(c,0);return c});
 const C2=new OfflineAudioContext(2,buf.length,buf.sampleRate),s=C2.createBufferSource();s.buffer=buf;let nd=s;BANDS.forEach((f,j)=>{const q=C2.createBiquadFilter();q.type=j==0?'lowshelf':j==BANDS.length-1?'highshelf':'peaking';q.frequency.value=f;q.Q.value=1.1;q.gain.value=corr[j];nd.connect(q);nd=q});for(const[t,f,g]of M2.ueq||[])if(g){const q=C2.createBiquadFilter();q.type=t=='middip'?'peaking':t;q.frequency.value=f;q.Q.value=t=='middip'?.45:.8;q.gain.value=g;nd.connect(q);nd=q}nd.connect(C2.destination);s.start();const o=await C2.startRendering();limit(o,M2.loud||-14,-1,M2);return o}
function limit(buf,rmsDb,ceilDb,M2={}){const a=buf.getChannelData(0),b=buf.getChannelData(1),n=a.length;
 // the ending may rise only endCap dB over the loudest stretch under the voice
 {const w=Math.round(.4*buf.sampleRate),nw=Math.floor(n/w),rw=[];for(let k=0;k<nw;k++){let e=0;for(let i=k*w;i<(k+1)*w;i+=4)e+=a[i]*a[i]+b[i]*b[i];rw.push(Math.sqrt(e/(w/4)+1e-12))}const k0=Math.floor(nw*.7),vs=rw.slice(0,k0).sort((x,y)=>x-y),ref=vs[Math.floor(vs.length*.9)]||0,cap=ref*10**((M2.endCap??2)/20);
  if(ref>0){const gk=rw.map((r,k)=>k<k0||r<=cap?1:cap/r);for(let k=1;k<gk.length;k++)gk[k]=Math.min(gk[k],gk[k-1]+.25);for(let k=gk.length-2;k>=0;k--)gk[k]=Math.min(gk[k],gk[k+1]+.25);for(let i=0;i<n;i++){const x=i/w-.5,k=Math.max(0,Math.min(gk.length-1,Math.floor(x))),k1=Math.min(gk.length-1,k+1),f=Math.max(0,Math.min(1,x-k)),gg=gk[k]*(1-f)+gk[k1]*f;if(gg<1){a[i]*=gg;b[i]*=gg}}}}
let e=0,e1=0;const n1=Math.floor(n*.7);for(let i=0;i<n;i+=2){const q=a[i]*a[i]+b[i]*b[i];e+=q;if(i<n1)e1+=q}const rA=Math.sqrt(e/n+1e-12),rV=Math.sqrt(e1/Math.max(1,n1)+1e-12),vW=M2.vW??.65,rms=Math.exp((1-vW)*Math.log(rA)+vW*Math.log(rV)),g0=db(rmsDb)/rms,ceil=db(ceilDb),req=new Float32Array(n);for(let i=0;i<n;i++){const p=Math.max(Math.abs(a[i]),Math.abs(b[i]))*g0;req[i]=p>ceil?ceil/p:1}const rel=1-Math.exp(-1/(.08*buf.sampleRate)),att=1-Math.exp(-1/(.0025*buf.sampleRate));for(let i=1;i<n;i++)req[i]=Math.min(req[i],req[i-1]+(1-req[i-1])*rel);for(let i=n-2;i>=0;i--)req[i]=Math.min(req[i],req[i+1]+(1-req[i+1])*att);for(let i=0;i<n;i++){const g=g0*req[i];a[i]*=g;b[i]*=g}}
// measured balance: every part's active level against a target, then masking: in each octave band the part that owns it
// keeps it and anything sitting within 6 dB of it is carved 3-6 dB at that band's centre
const BTGT={sub:-19,bass:-14.5,drums:-15.5,keys:-14,pad:-18,pad2:-21,pulse:-16,riff:-15,lead:-11,counter:-17,color:-20,dbl:-22},
 BBAND=[[60,250,120],[250,800,450],[800,2500,1400],[2500,6000,3800]],
 BPRI=[['bass','sub','drums','keys','pad','pad2','counter'],['keys','pad','pulse','bass','counter','pad2'],['lead','riff','keys','pulse','pad','counter','color','dbl'],['lead','riff','drums','color','pulse','keys','dbl']];
function balance(buf,SN,S){const sr=buf.sampleRate,N=2048,fl=Math.round(sr*.05),out={g:{},cut:{},lv:{}},E={},LV={},TOT={};
 for(let i=0;i<SN.length;i++){const x=buf.getChannelData(i),fr=[];for(let s=0;s+fl<=x.length;s+=fl){let e=0;for(let j=s;j<s+fl;j+=2)e+=x[j]*x[j];fr.push(e/(fl/2))}const mx=Math.max(1e-12,...fr),act=fr.filter(e=>e>mx*1e-3),tot=fr.reduce((a,b)=>a+b,0);
  LV[SN[i]]=10*Math.log10(act.reduce((a,b)=>a+b,0)/Math.max(1,act.length)+1e-12);TOT[SN[i]]=tot;
  const be=[0,0,0,0];let nf=0;for(let s=0;s+N<=x.length;s+=N*3){nf++;let e=0;for(let j=0;j<N;j+=4)e+=x[s+j]*x[s+j];if(e/(N/4)<mx*1e-4)continue;const re=new Float64Array(N),im=new Float64Array(N);for(let j=0;j<N;j++)re[j]=x[s+j]*(.5-.5*Math.cos(2*Math.PI*j/N));fft(re,im);for(let k=1;k<N/2;k++){const f=k*sr/N;for(let q=0;q<4;q++)if(f>=BBAND[q][0]&&f<BBAND[q][1]){be[q]+=re[k]*re[k]+im[k]*im[k];break}}}
  E[SN[i]]=be.map(v=>10*Math.log10(v/Math.max(1,nf)+1e-12))}
 const tg=Object.assign({},BTGT,S.bal||{});if(S.bal&&S.bal.bass!=null)tg.bass-=2.5;if(S.bal&&S.bal.sub!=null)tg.sub-=2;{const mel=SN.filter(n=>!/^(bass|sub|drums)$/.test(n)).length,thin=clamp(4-mel,0,3);if(thin){tg.bass-=1.6*thin;tg.sub-=1.6*thin;tg.drums-=.8*thin}}let before=0,after=0;
 const dl={};for(const n of SN){const sl=(S.mix&&S.mix[n]&&S.mix[n].lvl!=null&&STRIP[n]&&STRIP[n].lvl)?20*Math.log10(S.mix[n].lvl/STRIP[n].lvl):0;const sl2=/^(drums|bass|sub)$/.test(n)?Math.min(0,sl):sl;dl[n]=(tg[n]??tg[n.replace(/2$/,'')]??-18)-(/2$/.test(n)?1.5:0)+sl2-LV[n]}const md=[...SN.map(n=>dl[n])].sort((a,b)=>a-b)[SN.length>>1];
 for(const n of SN){const low=/^(bass|sub|drums)$/.test(n);out.g[n]=clamp(dl[n]-md,-16,low?2:14)}
 {const gs=SN.map(n=>out.g[n]),spread=Math.max(...gs)-Math.min(...gs),CAP=13;
  if(spread>CAP){const k=CAP/spread;for(const n of SN)out.g[n]=+(out.g[n]*k).toFixed(2)}}
 for(const n of SN){before+=TOT[n];after+=TOT[n]*10**(out.g[n]/10)}
 const sh=clamp(10*Math.log10(before/Math.max(1e-12,after)),-3,3);for(const n of SN){const low=/^(bass|sub|drums)$/.test(n);out.g[n]=+clamp(out.g[n]+sh,-26,low?3:22).toFixed(2)}out.want={};for(const n of SN)out.want[n]=+tg[n.replace(/2$/,'')]||-18;
 for(let q=0;q<4;q++){const here=SN.filter(n=>E[n][q]>-200).map(n=>[n,E[n][q]+out.g[n]]),mx=Math.max(...here.map(x=>x[1]));if(!here.length)continue;const pri=BPRI[q],rank=n=>{const i=pri.indexOf(n);return i<0?99:i};
  const lead=here.filter(x=>x[1]>=mx-8).sort((a,b)=>rank(a[0])-rank(b[0]))[0];if(!lead)continue;
  const cs=here.filter(([n,e])=>n!=lead[0]&&!(q==0&&n=='drums')&&e>lead[1]-6).map(([n,e])=>[n,e-(lead[1]-6)]).sort((a,b)=>b[1]-a[1]).slice(0,2);
  for(const[n,d]of cs)(out.cut[n]=out.cut[n]||[]).push(['p',BBAND[q][2],-+(1.5+2.5*clamp(d/8,0,1)).toFixed(1),1.2])}
 for(const n of SN)out.lv[n]=+LV[n].toFixed(1);return out}
async function render(o,onStep){DC=o.ctx;if(o.source&&o.source!='original'&&!o.piece){onStep&&onStep('Choosing a piece from the library');try{o={...o,piece:await pickAny(o.seed,o.avoid,o.faith??.7,domG(o))}}catch(e){console.warn('library',e)}}const c=compose(o);if(o.song&&o.song.pump!=null)c.S={...c.S,pump:o.song.pump};if(o.ch){for(const n of c.notes){const x=o.ch[n.r.name]||o.ch[n.r.name.replace(/2$/,'')];if(x&&x.mute)n.skip=1}if(o.ch.drums&&o.ch.drums.mute)for(const h of c.hits)h.skip=1}if(o.solo){const k=o.solo;for(const n of c.notes)if(n.r.name!==k&&n.r.name.replace(/2$/,'')!==k)n.skip=1;for(const h of c.hits)if(k!=='drums')h.skip=1}if(globalThis.PBC_SOLO){const k=globalThis.PBC_SOLO;for(const n of c.notes)if(!k.includes(n.r.name))n.skip=1;for(const h of c.hits)if(!k.includes(GROUP[h.n]||'perc'))h.skip=1}const S=c.S,A=o.A||{},L=o.L,sr=44100,H=tools(rng(o.seed^0x51ed)),M2=merge(MASTER,S.master),FX=S.fx||{};{const g=o.song||{};if(g.width!=null)M2.side=g.width;if(g.warmth!=null)M2.sat=g.warmth;if(g.loud!=null)M2.loud=g.loud;if(g.air!=null)M2.air=g.air;if(g.glue!=null)M2.glue=[-8-20*g.glue,1+2.5*g.glue];M2.ueq=[['lowshelf',110,g.low||0],['peaking',450,g.lowmid||0],['peaking',1500,g.mid||0],['peaking',4000,g.presence||0],['highshelf',9000,g.high||0],['middip',clamp(((o.A&&o.A.f0)||150)*18,1100,3800),-(g.midDip??2)]];M2.monoHz=g.monoHz??130;M2.subHz=g.subHz??30;M2.endCap=g.endCap??2;M2.vW=g.vWeight??.65;M2.pocket=g.pocket??1;M2.drift=g.drift??2.6;M2.rr=g.rr??1}
 // load: each note's sample set (soft or hard layer), and the genre's kits
 const ART={flute:{s:'fl_stac',v:'fl_expvib'},fl_nv:{s:'fl_stac',v:'fl_expvib'},fl_expvib:{s:'fl_stac'},oboe:{s:'ob_stac',v:'ob_vib'},ob_vib:{s:'ob_stac'},clarinet:{s:'cl_stac'},bassoon:{s:'bsn_stac',v:'bsn_vib'},bsn_vib:{s:'bsn_stac'},tenorsax:{s:'tsax_st',v:'tsax_vib'},tsax_nv:{s:'tsax_st',v:'tsax_vib'},tsax_vib:{s:'tsax_st'},saxello:{s:'saxello_st'},saxello_nv:{s:'saxello_st'},trumpet:{s:'tpt_stac',v:'tpt_vib'},tpt_vib:{s:'tpt_stac'},trombone:{s:'tbn_stac',v:'tbn_vib'},tbn_vib:{s:'tbn_stac'},oldtbn:{s:'oldtbn_short',v:'oldtbn_vib'},oldtbn_vib:{s:'oldtbn_short'},horn:{s:'horn_stac'},tuba:{s:'tuba_stac'},violin:{s:'vln_solo_spic'},strings:{s:'vln_sec_spic'},vla_sec:{s:'vla_sec_spic'},vc_sec:{s:'vc_sec_spic'},cb_solo_arco:{s:'cb_solo_spic'},erhu:{s:'erhu_short'},rec_sop:{s:'rec_sop_st'},rec_alto:{s:'rec_alto_st'},rec_ten:{s:'rec_ten_st'},ocarina_s:{s:'ocarina_st'},harm20f_vib:{s:'harm20f_st'},harm20c:{v:'harm20f_vib'},green_twang:{s:'green_stac'},black_twang:{s:'black_stac'},darkblack:{s:'darkblack_stac'},sneaky:{s:'sneaky_mute'},psaltery:{s:'psaltery_sp'},cithara_f:{s:'cithara_m'},dantranh:{v:'dantranh_vib'}},ARTON=(o.song||{}).art??1;
 const sets=new Map();for(const n of c.notes){let dir,set;if(n.r.fx){dir='hq';set=n.r.set}else{let aid=n.r.id;const ar=ARTON&&ART[aid];if(ar){const lo=x=>INS[x]&&n.m>=INS[x][4]-2&&n.m<=INS[x][5]+2;if(ar.s&&n.dur<.3&&!n.leg2&&lo(ar.s))aid=ar.s;else if(ar.v&&n.dur>1.1&&lo(ar.v)){aid=ar.v;n.recVib=1}}n.aid=aid;const I0=INS[aid];dir=I0[2];set=Array.isArray(I0[1])?I0[1][n.v<.52?0:1]:I0[1]}n.bk=dir+'/'+set;sets.set(n.bk,[dir,set])}
 let done=0;onStep&&onStep('Loading '+sets.size+' instruments');const B={};
 await Promise.all([...sets].map(async([k,[dir,set]])=>{try{B[k]={b:await bank(dir,set),dir,set}}catch(e){B[k]=null}onStep&&onStep(`Loading instruments ${++done}/${sets.size}`)}));
 const kitNames=[...new Set([...(c.kits||S.kits||[]),...Object.values(c.kitFor||{})])],KD={};kitNames.push('studio',...(c.hits.some(h=>GROUP[h.n]=='fx')?['efx']:[]));await Promise.all(kitNames.map(async k=>{try{KD[k]=await kitFile(k)}catch(e){}}));
 const need=new Map(),RRN={},RRC={};for(const n of [...c.notes].sort((p,q)=>p.t-q.t)){const x=B[n.bk];if(!x){n.skip=1;continue}n.key=nearest(x.b.keys,n.m);{const rk=n.r.name+'|'+n.m,lt=RRN[rk];if((o.song||{}).rr!==0&&lt!=null&&n.t-lt<2.5&&x.b.keys.length>3&&(RRC[rk]=(RRC[rk]||0)+1)%2){let alt=null,ad=9;for(const kk of x.b.keys)if(kk!=n.key&&Math.abs(kk-n.m)<ad){ad=Math.abs(kk-n.m);alt=kk}if(alt!=null&&ad<=3)n.key=alt}RRN[rk]=n.t}n.tune=x.b.tune[n.key]||0;n.id=n.bk+'/'+n.key;if(!need.has(n.id))need.set(n.id,sample(x.dir,x.set,n.key,x.b))}
 const rr={},hneed=new Map(),KF=c.kitFor||{},slot=n=>GROUP[n]=='kick'?'k':GROUP[n]=='snare'?'s':GROUP[n]=='hat'?'h':null;for(const h of c.hits){let kit=null;const pk=KF[slot(h.n)];if(pk&&KD[pk]&&KD[pk].hits[h.n])kit=pk;else for(const k of kitNames)if(KD[k]&&KD[k].hits[h.n]){kit=k;break}if(!kit){h.skip=1;continue}const arr=KD[kit].hits[h.n],i=(rr[h.n]=(rr[h.n]||0)+1)%arr.length;h.hid=kit+'/'+h.n+'/'+i;if(!hneed.has(h.hid))hneed.set(h.hid,hitSample(kit,h.n,i,arr[i]))}
 const SB={},HB={};await Promise.all([...need].map(async([id,p])=>{try{SB[id]=await p}catch{}}).concat([...hneed].map(async([id,p])=>{try{HB[id]=await p}catch{}})));
 onStep&&onStep('Mixing '+S.n);
 // the band on a stage: bass, kick, snare, the lead line and the pad bed in the centre; everyone else gets their own seat
 // left or right, so no two parts share a spot and the voice owns the middle
 const SN=[...new Set(c.notes.filter(n=>!n.skip&&SB[n.id]&&n.r.name!='mech').map(n=>n.r.name))];if(c.hits.some(h=>!h.skip&&HB[h.hid]))SN.push('drums');
 const LAY={bass:0,sub:0,lead:0,kick:0,snare:.02,pad:0,pad2:0};{const side=['keys','pulse','riff','counter','color','dbl'].filter(x=>SN.includes(x)),seat=[-.26,.3,-.38,.42,-.5,.52],flip=H.ch(.5)?-1:1;side.forEach((x,i)=>LAY[x]=seat[i]*flip);if(LAY.keys!=null)LAY.mech=LAY.keys;for(const n of SN)if(/^(keys|pulse)2$/.test(n)){const b=n.slice(0,-1),s0=Math.sign(LAY[b]||-.3)||-1;LAY[b]=s0*.55;LAY[n]=-s0*.55}}
 // complementary EQ: each part keeps its own octave and gives up the others
 const WHINE={organ:1,bell:1,synbrass:.95,synlead:.95,saw:.9,acid:.9,pipe:.85,reed:.8,brass:.78,solo:.72,mallet:.7,ss:.8,rd:.8,tb:.7,ens:.55,bow:.55,synpad:.5,synth:.5,synthpluck:.5,pad:.45,harp:.42,pluck:.38,guitar:.32,piano:.26,epiano:.26,pizz:.4,stac:.5,synbass:.1,b808:.1};
const CARVE={pad:{hpf:150,eq:[['p',2600,-3,.9]]},pad2:{hpf:180,eq:[['p',2600,-3,.9]]},pulse:{hpf:180},riff:{hpf:250},color:{hpf:450},keys:{eq:[['p',300,-1.5,1]]},bass:{eq:[['p',2500,-2,1]]},counter:{eq:[['p',2500,-2,1]]},dbl:{hpf:500}};if(c.roles&&c.roles.sub)CARVE.bass={...(CARVE.bass||{}),hpf:85};
 // a string or key can only sound once: a repeated pitch chokes the last one, and each part has a polyphony limit
 {const srt=c.notes.filter(n=>!n.skip).sort((a,b)=>a.t-b.t),by=new Map(),live=new Map();for(const n of srt){const k=n.r.name+'|'+n.m+'|'+(n.uni||0),pv=by.get(k);if(pv&&pv.t<n.t-.005)pv.cut=Math.min(pv.cut??1e9,n.t+.015);by.set(k,n);
  const rn=n.r.name;let a=(live.get(rn)||[]).filter(x=>Math.min(x.cut??1e9,x.t+x.dur+.6)>n.t);const cap=(SUST.has(n.r.kind)?12:n.r.guitar||n.r.kind=='guitar'?7:14)*(n.r.uniN||1);while(a.length>=cap){const o=a.shift();o.cut=Math.min(o.cut??1e9,n.t+.02)}a.push(n);live.set(rn,a)}}
 // the whole band tunes to the reader: speech centred 20 cents flat gets a band 20 cents flat
 const TUNE=clamp(A.cents||0,-45,45);
 const graph=async(full,BAL)=>{const SR=full?sr:16000,C=new OfflineAudioContext(full?2:Math.max(1,SN.length),Math.ceil(L*SR),SR),R=rng(o.seed^0x9e37),H=tools(R);let SMG=null;
  if(!full){const NY=SR*.45,AP=Object.getOwnPropertyDescriptor(AudioParam.prototype,'value'),mk0=C.createBiquadFilter.bind(C);C.createBiquadFilter=()=>{const b=mk0(),fq=b.frequency;Object.defineProperty(fq,'value',{get(){return AP.get.call(fq)},set(v){AP.set.call(fq,Math.min(v,NY))}});for(const fn of['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime']){const o=fq[fn].bind(fq);fq[fn]=(v,...a)=>o(Math.min(v,NY),...a)}return b};C.destination.channelCount=Math.max(1,SN.length);C.destination.channelCountMode='explicit';C.destination.channelInterpretation='discrete';SMG=C.createChannelMerger(Math.max(1,SN.length));SMG.connect(C.destination)}
 // master chain
 const crv=k=>{const cv=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/1023.5-1;cv[i]=Math.tanh(k*x+.05*x*x)/Math.tanh(k)}return cv};
 const M=C.createGain();M.gain.value=1.6;const SINK=C.createGain(),PKS=[];if(full){
 // the voice's pocket: the centre (mid) channel dips around the voice's chest tone and its consonant band while it speaks
 if(A.act&&A.act.length){const h=A.actHop||.05,f1=clamp((A.f0||140)*2,170,520),n0=Math.ceil(L/.025)+1,cv=new Float32Array(n0);let e=0;for(let i=0;i<n0;i++){const tt=i*.025-c.offset,v=tt<0||tt>=A.len?0:A.act[Math.min(A.act.length-1,Math.floor(tt/h))]||0;e+=(v-e)*(v>e?.4:.08);cv[i]=Math.min(1,e*1.25)}
  for(const[f,g0,q]of[[f1,-2.5,1.1],[1000,-1.8,.6],[2700,-4.5,.7]]){const pk=C.createBiquadFilter();pk.type='peaking';pk.frequency.value=f;pk.Q.value=q;pk.gain.setValueCurveAtTime(cv.map(x=>g0*x*(M2.pocket??1)),0,L);PKS.push(pk)}}
const mhp=C.createBiquadFilter();mhp.type='highpass';mhp.frequency.value=24;const mud=C.createBiquadFilter();mud.type='peaking';mud.frequency.value=420;mud.Q.value=.9;mud.gain.value=-2;
 const glue=C.createDynamicsCompressor();glue.threshold.value=M2.glue[0];glue.knee.value=10;glue.ratio.value=M2.glue[1];glue.attack.value=.03;glue.release.value=.15;M.connect(mhp).connect(mud).connect(glue);
 const post=C.createGain();glue.connect(post);
 const satIn=C.createBiquadFilter();satIn.type='bandpass';satIn.frequency.value=900;satIn.Q.value=.45;const sat=C.createWaveShaper();sat.curve=crv(3.2);sat.oversample='4x';const satG=C.createGain();satG.gain.value=M2.sat;glue.connect(satIn).connect(sat).connect(satG).connect(post);
 const exIn=C.createBiquadFilter();exIn.type='highpass';exIn.frequency.value=3500;const exS=C.createWaveShaper();exS.curve=crv(4);exS.oversample='4x';const exG=C.createGain();exG.gain.value=M2.ex;glue.connect(exIn).connect(exS).connect(exG).connect(post);
 const spl=C.createChannelSplitter(2),mgr=C.createChannelMerger(2),mid=C.createGain(),sHP=C.createBiquadFilter(),sSh=C.createBiquadFilter(),side=C.createGain(),sInv=C.createGain(),lM=C.createGain(),rM=C.createGain(),lS=C.createGain(),rS=C.createGain();post.connect(spl);lM.gain.value=rM.gain.value=.5;lS.gain.value=.5;rS.gain.value=-.5;spl.connect(lM,0);spl.connect(rM,1);spl.connect(lS,0);spl.connect(rS,1);lM.connect(mid);rM.connect(mid);lS.connect(sHP);rS.connect(sHP);sHP.type='highpass';sHP.frequency.value=140;sSh.type='highshelf';sSh.frequency.value=4000;sSh.gain.value=1.5;sHP.connect(sSh).connect(side);side.gain.value=M2.side;side.connect(sInv);sInv.gain.value=-1;let mtail=mid;for(const pk of PKS){mtail.connect(pk);mtail=pk}mtail.connect(mgr,0,0);mtail.connect(mgr,0,1);side.connect(mgr,0,0);sInv.connect(mgr,0,1);
 const air=C.createBiquadFilter();air.type='highshelf';air.frequency.value=11000;air.gain.value=M2.air;let mout=mgr.connect(air);
 if(M2.lp){const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=M2.lp;lp.Q.value=.6;mout=mout.connect(lp)}
 if(M2.wow){const d=C.createDelay(.05);d.delayTime.value=.012;const w1=C.createOscillator(),g1=C.createGain(),w2=C.createOscillator(),g2=C.createGain();w1.frequency.value=.55;g1.gain.value=.0016*M2.wow;w2.frequency.value=6.3;g2.gain.value=.00012*M2.wow;w1.connect(g1).connect(d.delayTime);w2.connect(g2).connect(d.delayTime);w1.start(0);w2.start(0);mout=mout.connect(d)}
 mout.connect(C.destination);
 if(M2.vinyl&&KD.fx&&KD.fx.hits.vinyl){try{const vb=await hitSample('fx','vinyl',0,KD.fx.hits.vinyl[0]),vs=C.createBufferSource(),vg=C.createGain(),vh=C.createBiquadFilter();vs.buffer=vb;vs.loop=true;vh.type='highpass';vh.frequency.value=700;vg.gain.value=db(-31)*M2.vinyl;vs.connect(vh).connect(vg).connect(M);vs.start(0)}catch(e){}}
 }
 // shared spaces: one convolution room per type, shared by every instrument that uses it; returns duck under the lead
 const RET=[],VERB={},verbLen={room:FX.room||1.2,hall:FX.hall||3.4,plate:FX.plate||2.2,spring:FX.spring||1.8,chamber:FX.chamber||1.7,gated:FX.gated||.4};
 const verb=t=>{if(!full)return SINK;if(VERB[t])return VERB[t];const cv=C.createConvolver();cv.buffer=ir(t,verbLen[t]||1.6);const lo=C.createBiquadFilter();lo.type='highpass';lo.frequency.value=t=='plate'?380:t=='spring'?300:320;const hi=C.createBiquadFilter();hi.type='lowpass';hi.frequency.value=t=='plate'?11000:t=='spring'?5500:t=='hall'?7500:9000;const g=C.createGain(),lv=t=='plate'?.55:t=='spring'?.5:.6;g.gain.value=lv;RET.push([g,lv]);cv.connect(lo).connect(hi).connect(g);let ro=g;if(S.edm&&S.pump){const pg=C.createGain();ro.connect(pg);ro=pg;PUMP.push([pg,.8])}ro.connect(M);return VERB[t]=cv};
 let DLY=null;const delay=()=>{if(!full)return SINK;if(DLY)return DLY;const cfg=FX.dly||{div:.75,fb:.3},t=clamp(cfg.div*60/c.bpm,.05,1.9),inp=C.createGain(),dl=C.createDelay(2),dr2=C.createDelay(2),fb=C.createGain(),f1=C.createBiquadFilter(),f2=C.createBiquadFilter(),pl=C.createStereoPanner(),pr=C.createStereoPanner(),o2=C.createGain();dl.delayTime.value=t;dr2.delayTime.value=t;fb.gain.value=cfg.fb;f1.type='highpass';f1.frequency.value=300;f2.type='lowpass';f2.frequency.value=4500;pl.pan.value=-.7;pr.pan.value=.7;o2.gain.value=.55;inp.connect(f1).connect(f2).connect(dl);dl.connect(pl).connect(o2);dl.connect(dr2);dr2.connect(pr).connect(o2);dr2.connect(fb).connect(dl);o2.connect(M);const vs=C.createGain();vs.gain.value=.25;o2.connect(vs).connect(verb('plate'));return DLY=inp};
 const modu=(inp,m)=>{if(!m)return inp;const out=C.createGain();if(m.t=='chorus'){inp.connect(out);for(const[sd,base,rt]of[[-1,.011,.23],[1,.016,.31]]){const d=C.createDelay(.05);d.delayTime.value=base;const lf=C.createOscillator(),lg=C.createGain();lf.frequency.value=rt*(m.r||1);lg.gain.value=.0025*sd;lf.connect(lg).connect(d.delayTime);lf.start(0);const p=C.createStereoPanner();p.pan.value=sd*.9;const w=C.createGain();w.gain.value=m.d||.3;inp.connect(d).connect(w).connect(p).connect(out)}return out}
  if(m.t=='trem'){const tr=C.createGain(),lf=C.createOscillator(),lg=C.createGain(),pp=C.createStereoPanner(),pg=C.createGain();lf.frequency.value=m.r||5.5;lg.gain.value=m.d||.25;tr.gain.value=1-(m.d||.25);lf.connect(lg).connect(tr.gain);pg.gain.value=(m.d||.25);lf.connect(pg).connect(pp.pan);lf.start(0);inp.connect(tr).connect(pp).connect(out);return out}
  if(m.t=='rotary'){for(const[sd,rt]of[[-1,m.r||.8],[1,(m.r||.8)*1.13]]){const d=C.createDelay(.03),lf=C.createOscillator(),lg=C.createGain(),am=C.createGain(),ag=C.createGain(),p=C.createStereoPanner(),pg=C.createGain();d.delayTime.value=.006;lf.frequency.value=rt;lg.gain.value=.0012*(m.d||.5)*2;lf.connect(lg).connect(d.delayTime);am.gain.value=.7;ag.gain.value=.3*(m.d||.5);lf.connect(ag).connect(am.gain);pg.gain.value=.6*sd;lf.connect(pg).connect(p.pan);lf.start(0);inp.connect(d).connect(am).connect(p).connect(out)}return out}
  return inp};
 const haas=(inp,ms)=>{if(!ms)return inp;const sp2=C.createChannelSplitter(2),mg=C.createChannelMerger(2),d=C.createDelay(.05);d.delayTime.value=ms/1000;inp.connect(sp2);sp2.connect(mg,0,0);sp2.connect(d,1).connect(mg,0,1);return mg};
 // channel strip: gain, filters, EQ, compression, parallel saturation, modulation, width, sends
 const DIPS=[],strips={},PUMP=[],DYN={},VIB={},EXPR=[],SWF=[],FXD=[],MUSIC=new Set(['keys','pulse','riff','pad','pad2','lead','color','counter','dbl']);
 const DUCKD={},VDK=[],PRES=[],CLEANUP=[];let PENDING=null,STARTED=false;
 PBCSTAT.ctxMade++;
const strip=(name,spec,toward)=>{const k=name;if(strips[k])return strips[k];const nb=name.replace(/2$/,''),st=merge(STRIP[name]||STRIP[nb]||STRIP.perc,spec),inp=C.createGain();if(LAY[name]!=null){st.pan=LAY[name];st.spread=Math.min(st.spread||0,.3)}const cv0=CARVE[name]||CARVE[nb];let dp=0;if(full&&!/^(drums|perc|fx|mech|bass|sub)$/.test(nb)){let hh=2166136261;for(const ch of nb+o.seed)hh=Math.imul(hh^ch.charCodeAt(0),16777619);const D0={lead:.12,counter:.35,keys:.32,pulse:.45,riff:.42,color:.62,pad:.72,dbl:.5}[nb]??.4;dp=clamp(D0+(((hh>>>0)%1000)/1000-.5)*.3,0,1)*((o.song||{}).depth??1);st.pre=(st.pre||.015)+dp*.024;st.verb=st.verb&&st.verb.s?{...st.verb,s:Math.min(.6,st.verb.s+dp*.1)}:{t:'room',s:.05+dp*.12};st.eq=(st.eq||[]).concat([['hs',7000,-dp*3.5]])}if(cv0){if(cv0.hpf)st.hpf=Math.max(st.hpf||0,cv0.hpf);st.eq=(st.eq||[]).concat(cv0.eq||[])}if(full&&BAL.cut[name])st.eq=(st.eq||[]).concat(BAL.cut[name]);const ux=o.ch&&(o.ch[name]||o.ch[nb]);if(ux){if(ux.pan!=null)st.pan=ux.pan;if(ux.sep!=null){st.sep=ux.sep;st.width=(st.width||0)*ux.sep;st.spread=(st.spread||0)*ux.sep}if(ux.verb!=null)st.verb={t:ux.space||(st.verb&&st.verb.t)||'room',s:ux.verb};if(ux.dly!=null)st.dly=ux.dly;if(ux.hpf!=null)st.hpf=ux.hpf;if(ux.lpf!=null)st.lpf=ux.lpf<19900?ux.lpf:0;if(ux.sat!=null)st.sat=ux.sat;const ue=[];if(ux.low)ue.push(['ls',180,ux.low]);if(ux.mid)ue.push(['p',ux.midF||1200,ux.mid,1]);if(ux.high)ue.push(['hs',6000,ux.high]);st.eq=(st.eq||[]).concat(ue);if(ux.gain&&full)st.lvl=(st.lvl??.5)*db(ux.gain)}inp.gain.value=(st.lvl??.5)*(full?db(BAL.g[name]||0):1);let nd=inp;
  const f=(type,fr,g,q)=>{const b=C.createBiquadFilter();b.type=type;b.frequency.value=fr;if(g!=null)b.gain.value=g;if(q!=null)b.Q.value=q;nd.connect(b);nd=b;return b};
  if(st.hpf)f('highpass',st.hpf,null,.7);if(st.lpf)f('lowpass',st.lpf,null,.6);for(const[t,fr,g,q]of st.eq||[])f(t=='ls'?'lowshelf':t=='hs'?'highshelf':'peaking',fr,g,q||1);
  if(['pad','pad2','keys','pulse'].includes(name)){DIPS.push(f('peaking',250,0,1))}
  if(full&&c.sweeps&&c.sweeps.length&&MUSIC.has(nb))SWF.push([f('highpass',18,null,.9),f('lowpass',20000,null,.8)]);
  if(full&&S.edm&&S.edm.wob&&nb=='bass'){const w=S.edm.wob,lf=f('lowpass',w.base||900,null,4),o=C.createOscillator(),og=C.createGain();o.frequency.value=c.bpm/60/(c.wobRate||1);og.gain.value=w.depth||800;o.connect(og).connect(lf.frequency);o.start(Math.max(0,c.liftT??0))}
  if(full&&name=='fx'){const dg=C.createGain();nd.connect(dg);nd=dg;FXD.push(dg)}
  // velocity-keyed resonance notch: hard hits lose a little 3 kHz bite for a moment
  if(full&&['keys','pulse','riff','lead','counter','color'].includes(nb))DYN[name]=f('peaking',3000,0,1.3);
  if(full&&['pad','pad2','lead','counter','keys'].includes(name)){const eg=C.createGain();nd.connect(eg);nd=eg;EXPR.push([eg,name])}
  // sidechain pump: the beds breathe with the kick
  if(full&&S.pump&&['keys','pulse','pad','pad2','bass','sub','riff','color','counter'].includes(nb)){const pg=C.createGain();nd.connect(pg);nd=pg;PUMP.push([pg,name=='bass'?1:name=='pad'||name=='pad2'?1.25:.75])}
  if(ux&&ux.comp!=null)st.comp=ux.comp>0?[-8-30*ux.comp,1.5+6*ux.comp,.01,.15]:null;if(st.comp){const cp=C.createDynamicsCompressor();cp.threshold.value=st.comp[0];cp.ratio.value=st.comp[1];cp.attack.value=st.comp[2];cp.release.value=st.comp[3];cp.knee.value=8;nd.connect(cp);nd=cp}
  if(st.sat){const sum=C.createGain(),ws=C.createWaveShaper(),sg=C.createGain();ws.curve=crv(2.6);ws.oversample='2x';sg.gain.value=st.sat*.8;nd.connect(sum);nd.connect(ws).connect(sg).connect(sum);nd=sum}
  if(ux&&ux.chorus!=null)st.mod=ux.chorus>0?{t:(st.mod&&st.mod.t)||'chorus',d:ux.chorus,r:st.mod&&st.mod.r}:null;nd=modu(nd,st.mod);nd=haas(nd,st.width);if(full&&(o.song||{}).hrtf&&!/^(drums|perc|fx|mech|bass|sub)$/.test(nb)){const pz=C.createPanner();pz.panningModel='HRTF';pz.distanceModel='inverse';pz.refDistance=1;pz.rolloffFactor=0;const az=clamp(st.pan||0,-1,1)*1.15,ds=1+dp*2.5;pz.positionX.value=Math.sin(az)*ds;pz.positionY.value=.15;pz.positionZ.value=-Math.cos(az)*ds;nd.connect(pz);const hg=C.createGain();hg.gain.value=1.12;pz.connect(hg);nd=hg}if(!full&&!toward){const j=SN.indexOf(name=='mech'?'keys':name);nd.connect(j<0?SINK:SMG,0,j<0?0:j)}else nd.connect(toward||M);
  if(full&&st.verb&&st.verb.s){const pd=C.createDelay(.2);pd.delayTime.value=st.pre||.015;const sg=C.createGain();sg.gain.value=st.verb.s;nd.connect(pd).connect(sg).connect(verb(st.verb.t))}
  if(full&&S.edm&&S.edm.ott&&S.edm.ott[nb]){const oc=C.createDynamicsCompressor();oc.threshold.value=-42;oc.ratio.value=12;oc.attack.value=.002;oc.knee.value=2;oc.release.value=.07;const oh=C.createBiquadFilter();oh.type='highshelf';oh.frequency.value=5000;oh.gain.value=4;const og=C.createGain();og.gain.value=S.edm.ott[nb];nd.connect(oc).connect(oh).connect(og).connect(toward||M)}
  if(full&&name=='drums'){const pc=C.createDynamicsCompressor();pc.threshold.value=-32;pc.ratio.value=6;pc.attack.value=.003;pc.knee.value=4;pc.release.value=.09;const pg=C.createGain();pg.gain.value=.38;nd.connect(pc).connect(pg).connect(toward||M)}
  if(full&&st.dly){const sg=C.createGain();sg.gain.value=st.dly;nd.connect(sg).connect(delay())}
  {const dk=C.createGain();dk.connect(inp);if(full&&DUCKD[nb])VDK.push([dk,DUCKD[nb]]);return strips[k]={inp:dk,st}}};
 const mixOf=n=>{const b=(S.mix||{})[n]??(S.mix||{})[n.replace(/2$/,'')],r=c.roles&&c.roles[n];if(r&&r.kind=='pipe')return merge(b||{},{verb:{t:'hall',s:.46},pre:.035,eq:[['p',3200,-1.5,1],['hs',9000,-2]]});return b};
 // instruments
 const DRF={};const NZ=C.createBuffer(1,sr*2,sr);{const z=NZ.getChannelData(0),Rn=rng(77);for(let i=0;i<z.length;i++)z[i]=Rn()*2-1}
 const playN=n=>{if(n.skip)return;const Sb=SB[n.id];if(!Sb)return;const r=n.r,k=r.kind,f=FEEL[k]||FEEL.piano,sp=strip(r.name,mixOf(r.name)),sus=SUST.has(k)&&!r.fx,t=Math.max(0,n.t),v=n.v,gn=Math.pow(v,1.6)*(r.fx?.9:1)*(n.gm||1),tuned=SCOOPK.has(k)||k=='ens'||k=='bow';
  const rate=2**((n.m-n.key)/12+(n.tune+TUNE+(r.drift||0)+(n.det||0)+H.g()*(r.fx?0:tuned?2.2:.5))/1200);
  const att=(n.leg2?1.7:1)*(sus?(v<.45?1.6:v>.72?.6:1):1)*f.att*(sus?clamp(120/c.bpm,.6,1.3):1)+(r.fx?0:(1-v)*(sus?.025:.005)),start=t;let rel=f.rel*(k=='piano'&&H.ch(.7)?1.6:1)*(r.fx?1:.7+.8*R()),end=t+n.dur;if(n.cut!=null&&n.cut<end+rel){end=Math.max(start+att+.02,Math.min(end,n.cut));rel=Math.min(rel,.07)}
  const g=C.createGain(),lp=C.createBiquadFilter(),pn=C.createStereoPanner();lp.type='lowpass';const reg=n.m>84?.85:n.m<48?.8:1;const UXr=(o.ch&&(o.ch[r.name]||o.ch[r.name.replace(/2$/,'')]))||{};{const f0=(['synpad','saw','synlead','synbrass','synthpluck','synth'].includes(k)?7000+13000*Math.pow(v,.8):2800+17000*Math.pow(v,1.1))*reg;lp.frequency.value=clamp((20000-(20000-f0)*(UXr.track??1))*(1+.05*H.g()),500,20000)}lp.Q.value=.5;if(n.fill)lp.frequency.value=Math.min(lp.frequency.value,12500);else if(n.uni==9)lp.frequency.value=Math.min(lp.frequency.value,14500);
  pn.pan.value=clamp((sp.st.pan||0)+(n.pan||0)*(sp.st.sep??1)+(sp.st.spread||0)*(n.m-62)/40+H.g()*.03,-.9,.9);if(k=='acid'){lp.Q.value=5+9*v;const f0=clamp(600+7000*v*v,600,9000);lp.frequency.setValueAtTime(f0,t);lp.frequency.setTargetAtTime(Math.max(280,f0*.1),t+.008,.07+.12*(1-v))}
  const TD=(full&&!r.fx?{reed:.11,pipe:.10,brass:.075,solo:.07,bow:.055,ens:.05,ss:.10,rd:.10,tb:.08,mallet:.26,organ:.055,pad:.05,synpad:.05,saw:.04,synth:.04,epiano:.035,guitar:.03,harp:.03,pluck:.03,piano:0,stac:0,b808:0,synbass:0}[k]??.03:0)*((o.song||{}).expr??1)*(n.dur>.3?1:0);
  let tre=null;if(TD>0){tre=C.createGain();tre.gain.value=1;g.connect(tre)}const src0=tre||g;
  const lpOn=k=='acid'||lp.frequency.value<18500||(sus&&n.dur>=.9&&lp.frequency.value*1.3<18500);let tail=lpOn?lp:src0;if(k=='brass'||r.id=='tenorsax'||r.id=='saxello'){const fm=C.createBiquadFilter();fm.type='peaking';fm.frequency.value=700+800*v;fm.Q.value=1.1;fm.gain.value=3;tail.connect(fm);tail=fm}if((k=='guitar'||k=='reed')&&v>.7){const dm=C.createBiquadFilter();dm.type='peaking';dm.frequency.value=3000;dm.Q.value=1.4;dm.gain.value=-(v-.7)*10;tail.connect(dm);tail=dm}if(lpOn)src0.connect(lp);tail.connect(pn).connect(sp.inp);
  if(full&&!r.fx&&['reed','pipe','brass','solo','ss','rd','tb'].includes(k)&&n.dur>.2){const ns=C.createBufferSource(),bp=C.createBiquadFilter(),ng=C.createGain();ns.buffer=NZ;ns.loop=true;bp.type='bandpass';bp.frequency.value=clamp(440*2**((n.m-69)/12)*3,1800,9000);bp.Q.value=.8;ns.connect(bp).connect(ng).connect(pn);const a0=Math.max(.1,.9-v)*.085*gn*((o.song||{}).expr??1);ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(a0,t+.03);ng.gain.linearRampToValueAtTime(a0*.35,t+.3);ng.gain.linearRampToValueAtTime(0,t+n.dur+.1);ns.start(t,R()*1.5);ns.stop(t+n.dur+.15)}
  g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gn,start+att);const avail=Sb.duration/rate;
  if(sus){const decayed=gn*db(-2.5*Math.min(1,n.dur/4)),EX=(o.song||{}).expr??1;if(n.dur>=.4&&!r.fx&&EX>0){const pk=start+att+(end-start-att)*(.3+.35*R()),amt=(.12+.22*R())*EX*(n.dur>2?1.2:1),f0=lp.frequency.value;g.gain.linearRampToValueAtTime(gn*(1-.25*amt),start+att+.05);g.gain.linearRampToValueAtTime(gn*(1+amt),pk);lp.frequency.setValueAtTime(f0*(1-.25*amt),start);lp.frequency.linearRampToValueAtTime(Math.min(20000,f0*(1+.6*amt)),pk);lp.frequency.linearRampToValueAtTime(f0*.85,Math.max(pk+.05,end));g.gain.linearRampToValueAtTime(decayed*(.65+.25*R()),Math.max(pk+.05,end))}else{if(n.dur>=.9){g.gain.linearRampToValueAtTime(gn*1.18,start+att+.4)}g.gain.linearRampToValueAtTime(decayed*(n.dur>=.9?.85:1),Math.max(start+att+.41,end))}g.gain.linearRampToValueAtTime(0,end+rel)}
  else{g.gain.setValueAtTime(gn,Math.max(start+att,end));g.gain.setTargetAtTime(0,Math.max(start+att,end),rel/3)}
  const stopAt=end+rel+.1;let mod_=null;if(n.sc){mod_=C.createConstantSource();const len=Math.max(.1,stopAt-start),pts=Math.max(8,Math.ceil(len*60)),cvv=new Float32Array(pts);for(let i=0;i<pts;i++){const tt=i/(pts-1)*len;cvv[i]=-n.sc*Math.exp(-tt/.03)}mod_.offset.setValueCurveAtTime(cvv,start,len);mod_.start(start);mod_.stop(stopAt)}
  let vib=null;{const EX=(o.song||{}).expr??1,VD={bow:17,solo:17,ens:6,reed:14,pipe:10,brass:9,synlead:9,synbrass:7,guitar:7,harp:4,pluck:9,pizz:3,mallet:3,pad:5,synpad:5,saw:4,synth:4,synthpluck:3,acid:3,ss:12,rd:12,tb:9,stac:0,piano:0,epiano:0,organ:0,synbass:0,b808:0}[k]??4,isErhu=/erhu/.test(r.id),dmin=k=='guitar'||k=='harp'||k=='pluck'?.6:.3;
  if(full&&!r.fx&&EX>0&&!n.recVib&&(VD||isErhu)&&n.dur>dmin){if(!VIB[r.name]){const lf=C.createOscillator(),lg=C.createGain();lf.frequency.value=.11+.08*R();lg.gain.value=.35;lf.connect(lg);lf.start(0);VIB[r.name]=lg}
   const reg=clamp((n.m-48)/36,0,1),dep=(isErhu?22:VD)*(.6+.6*v)*(.8+.5*reg)*(UXr.vib??1)*EX*(n.dur<.9?.55:1)*(.85+.3*R()),on=UXr.vibDelay??(.12+.25*R()+(n.leg2?-.06:0));vib=C.createGain();vib.gain.setValueAtTime(0,start);vib.gain.setValueAtTime(0,start+Math.max(0,on));vib.gain.linearRampToValueAtTime(dep*.6,start+on+.25);vib.gain.linearRampToValueAtTime(dep,start+on+.7+.3*R());
   const vo=C.createOscillator(),r0=(k=='bow'||k=='solo'||isErhu?5.4:k=='guitar'||k=='harp'?5:5.6)+.8*R();vo.frequency.setValueAtTime(r0-.7,start);vo.frequency.linearRampToValueAtTime(r0,start+on+.8);VIB[r.name].connect(vo.frequency);vo.connect(vib);vo.start(start);vo.stop(start+n.dur+1.6)}}
  if(tre){const on=(UXr.vibDelay??(.14+.22*R()))*(n.leg2?.5:1),rt=(k=='mallet'?6.9:k=='organ'?5.9:4.9+.9*R())*(k=='mallet'?1:1),
    dep=TD*(.65+.5*v)*(n.dur<.9?.6:1),to=C.createOscillator(),tg=C.createGain();
   to.frequency.setValueAtTime(rt*.86,start);to.frequency.linearRampToValueAtTime(rt,start+on+.7);
   tg.gain.setValueAtTime(0,start);tg.gain.setValueAtTime(0,start+Math.max(0,on));tg.gain.linearRampToValueAtTime(dep*.55,start+on+.28);tg.gain.linearRampToValueAtTime(dep,start+on+.75+.3*R());
   to.connect(tg).connect(tre.gain);to.start(start);to.stop(stopAt+.05)}
  let drf=null;if(full&&!r.fx&&/^syn|saw|acid|synthpluck|synth$/.test(k)){if(!DRF[r.name]){const o1=C.createOscillator(),o2=C.createOscillator(),gg=C.createGain();o1.frequency.value=.17+.2*R();o2.frequency.value=.43+.3*R();gg.gain.value=M2.drift??2.6;o1.connect(gg);const g2=C.createGain();g2.gain.value=.6;o2.connect(g2).connect(gg);o1.start(0);o2.start(0);DRF[r.name]=gg}drf=DRF[r.name]}
  if(full&&!r.fx&&(k=='epiano'||k=='organ'||k=='mallet')){if(!DRF[r.name]){const o1=C.createOscillator(),o2=C.createOscillator(),gg=C.createGain(),g2=C.createGain();o1.frequency.value=.32+.5*R();o2.frequency.value=5+2*R();gg.gain.value=k=='organ'?3.2:5.2;o1.connect(gg);g2.gain.value=.38;o2.connect(g2).connect(gg);o1.start(0);o2.start(0);DRF[r.name]=gg}drf=DRF[r.name]}
  const play=()=>{const s=C.createBufferSource();s.buffer=Sb;if(vib)vib.connect(s.detune);if(drf)drf.connect(s.detune);if(n.slide!=null){s.playbackRate.setValueAtTime(rate*2**((n.slide-n.m)/12),start);s.playbackRate.exponentialRampToValueAtTime(rate,start+(n.slideT||.06))}else s.playbackRate.value=rate;if(mod_)mod_.connect(s.detune);return s};
  if(full&&!r.fx&&v>.18&&{piano:1,epiano:1,guitar:1,pluck:1,harp:1,bow:1,stac:0}[k]){
   const rs=C.createBufferSource(),rb=C.createBiquadFilter(),rg2=C.createGain(),rt=Math.min(end,L-.08);
   if(rt>start+.05){rs.buffer=NZ;rb.type='bandpass';
    rb.frequency.value=k=='piano'||k=='epiano'?clamp(180+n.m*3,160,620):k=='bow'?2000:clamp(440*Math.pow(2,(n.m-69)/12)*4.5,1500,5600);
    rb.Q.value=k=='bow'?.8:.9;rg2.gain.setValueAtTime(0,rt);
    const ra=(k=='piano'||k=='epiano'?.016:k=='bow'?.010:.013)*gn;
    rg2.gain.linearRampToValueAtTime(ra,rt+.006);rg2.gain.setTargetAtTime(0,rt+.008,k=='bow'?.045:.022);
    rs.connect(rb).connect(rg2).connect(pn);rs.start(rt,R()*1.2);rs.stop(rt+.3)}}
  if(sus&&stopAt-start>avail-.25){const xf=.35;let at=start,off=0,first=true;while(at<stopAt){const s=play(),sg=C.createGain();s.connect(sg).connect(g);const segEnd=Math.min(stopAt,at+(Sb.duration-off)/rate-.05);sg.gain.setValueAtTime(first?1:0,at);if(!first)sg.gain.linearRampToValueAtTime(1,at+xf);if(segEnd<stopAt){sg.gain.setValueAtTime(1,segEnd-xf);sg.gain.linearRampToValueAtTime(0,segEnd)}s.start(at,off);s.stop(segEnd+.01);if(segEnd>=stopAt-1e-6)break;first=false;off=.35+R()*.6;at=segEnd-xf}}
  else{const s=play();s.connect(g);s.start(start,['ens','pad','synpad','saw'].includes(k)?R()*.03:R()*.002);s.stop(stopAt)}};
 // drums: kit pieces through grouped strips (kick, snare, hats, cymbals, toms, percussion) into a drum bus
 const dbus=strip('drums',mixOf('drums'));const playH=h=>{if(h.skip)return;const b=HB[h.hid];if(!b)return;const grp=GROUP[h.n]||'perc',sp=grp=='fx'?strip('fx',mixOf('fx')):strip(grp,mixOf(grp),dbus.inp),s=C.createBufferSource(),g=C.createGain(),lp=C.createBiquadFilter(),pn=C.createStereoPanner();s.buffer=b;let kr=1;if(h.hid.startsWith('tr808/k')){let best=0,bd=99;for(const tg of[c.key,(c.key+7)%12])for(let d=-4;d<=4;d++)if(mod(31+d,12)==tg&&Math.abs(d-.22)<bd){bd=Math.abs(d-.22);best=d}kr=2**((best-.22+TUNE/100)/12)}let st0=Math.max(0,h.t),off=0;if(grp=='fx'){kr=1;if(h.fitT)kr=clamp(b.duration/h.fitT,.8,1.35);if(h.n=='drop')kr*=2**((mod(c.key+6,12)-6)/12);if(h.align=='end'){st0=h.t-b.duration/kr;if(st0<0){off=-st0*kr;st0=0}}}s.playbackRate.value=kr*(1+H.g()*.008);
  g.gain.value=Math.pow(clamp(h.v,0,1),1.5)*(grp=='kick'?1:grp=='cym'?.6:grp=='hat'?.55:.85);lp.frequency.value=clamp(2500+16000*h.v,2000,19000);pn.pan.value=clamp((DPAN[h.n]??sp.st.pan??0)+(sp.st.spread?H.g()*.1:0),-.8,.8);s.connect(lp).connect(g).connect(pn).connect(sp.inp);if(st0>=L)return;s.start(st0,off);s.stop(Math.min(L,grp=='fx'?st0+(b.duration-off)/kr+.05:h.t+(grp=='cym'?5:2.2)))};
 // just-in-time scheduling: notes are added a second ahead of the render head, so the graph only holds what is sounding
 for(const n of c.notes)if(!n.skip&&SB[n.id])strip(n.r.name,mixOf(n.r.name));if(full){for(const k in strips){if(/^(mech|kick|snare|hat|cym|tom|perc|fx)$/.test(k)||/2$/.test(k))continue;const st=strips[k].st,r=c.roles[k],ux=(o.ch&&o.ch[k])||{};CHAN[k]={id:r?r.id:null,label:r?INS[r.id][0]:'Drum kit',gain:ux.gain||0,oct:ux.oct||0,pan:+(st.pan||0).toFixed(2),sep:st.sep??1,verb:+((st.verb&&st.verb.s)||0).toFixed(2),space:(st.verb&&st.verb.t)||'room',dly:+(st.dly||0).toFixed(2),low:ux.low||0,mid:ux.mid||0,midF:ux.midF||1200,high:ux.high||0,hpf:st.hpf||20,lpf:st.lpf||20000,sat:+(st.sat||0).toFixed(2),mute:!!ux.mute,comp:ux.comp??(st.comp?+clamp((-8-st.comp[0])/30,0,1).toFixed(2):0),chorus:ux.chorus??(st.mod?+(st.mod.d||0).toFixed(2):0),jit:ux.jit??1,lean:ux.lean??({lead:8,counter:5,keys:3,pad:10,pad2:12,bass:-2,sub:-2,pulse:0,riff:2,color:4,dbl:6}[k]||0),dyn:ux.dyn??1,track:ux.track??1,strum:ux.strum??1,len:ux.len??1,glide:ux.glide??1,vib:ux.vib??1,vibDelay:ux.vibDelay??.5}}}for(const h of c.hits)if(!h.skip&&HB[h.hid]){const grp=GROUP[h.n]||'perc';if(grp=='fx')strip('fx',mixOf('fx'));else strip(grp,mixOf(grp),dbus.inp)}
 if(full&&EXPR.length){const beat=60/c.bpm,n0=Math.ceil(L/.05)+1;for(const[eg,name]of EXPR){const amp=name.startsWith('pad')?.2:name=='keys'?.08:.14,ph=(name.length*.7)%1,cv=new Float32Array(n0);for(let i=0;i<n0;i++){const B=(i*.05-c.offset)/beat;cv[i]=1-amp/2+amp*Math.sin(Math.PI*mod(B/8+ph*.25,1))}eg.gain.setValueCurveAtTime(cv,0,L)}}
 if(full){const beat=60/c.bpm,kt=c.hits.filter(h=>!h.skip&&HB[h.hid]&&GROUP[h.n]=='kick').map(h=>h.t).sort((a,b)=>a-b);
  if(SWF.length){const st=.02,n0=Math.ceil(L/st)+1,hpC=new Float32Array(n0).fill(18),lpC=new Float32Array(n0).fill(20000);for(const w of c.sweeps){const t0=c.offset+w.B0*beat,t1=c.offset+w.B1*beat;for(let i=Math.max(0,Math.floor(t0/st));i<n0&&i*st<t1;i++){const u=clamp((i*st-t0)/Math.max(.1,t1-t0),0,1),fq=w.f0*Math.pow(w.f1/w.f0,w.t=='hp'?Math.pow(u,1.8):Math.pow(u,.6));if(w.t=='hp')hpC[i]=Math.max(hpC[i],fq);else lpC[i]=Math.min(lpC[i],fq)}}for(const[hp,lp]of SWF){hp.frequency.setValueCurveAtTime(hpC,0,L);lp.frequency.setValueCurveAtTime(lpC,0,L)}}
  for(const[pg,dd]of PUMP){const d0=Math.min(.8,S.pump*dd);pg.gain.setValueAtTime(1,0);let last=-1;for(const t of kt){if(t-last<.08)continue;last=t;const d=d0*(c.liftT!=null&&t<c.liftT-.05?.72:1);pg.gain.setTargetAtTime(1-d,t,.004);pg.gain.setTargetAtTime(1,t+.03,beat*.16)}}
  for(const nm in DYN){const evs=[];for(const n of c.notes)if(!n.skip&&n.r.name==nm&&n.v>.62)evs.push([n.t,-4.5*Math.min(1,(n.v-.62)/.33)]);evs.sort((a,b)=>a[0]-b[0]);const pk=DYN[nm].gain;let lt=-1;for(const[t,g]of evs){if(t-lt<.03)continue;lt=t;pk.setTargetAtTime(g,Math.max(0,t-.003),.004);pk.setTargetAtTime(0,t+.07,.07)}}}
 // just-in-time scheduling needs a main-thread callback for every second of audio. a
 // hidden or throttled tab stops delivering those, and the render then hangs for ever
 // with no error. so: schedule everything up front when hidden, bail out of the
 // just-in-time path the moment we are hidden, and keep a watchdog behind both.
 {const Qn=[...c.notes.map(n=>[n.t,0,n]),...c.hits.map(h=>[h.t,1,h])].sort((a,b)=>a[0]-b[0]);let qi=0;
  const sched=u=>{while(qi<Qn.length&&Qn[qi][0]<u){const[,k,x]=Qn[qi++];k?playH(x):playN(x)}};sched(1.1);
  let flushed=false,flushDone=false,onHide=null,wd=null;
  const wake=()=>{if(!STARTED)return;try{const p=C.resume();if(p&&p.catch)p.catch(()=>{})}catch(e){}};
  // the flush is sliced into 10 ms pieces with a yield between them, so it can never
  // become one long task. the context stays suspended across the yields, so the render
  // head does not advance and every note still lands on its own time.
  const slice=()=>{const t0=(performance&&performance.now)?performance.now():Date.now();
   while(qi<Qn.length){const[,k,x]=Qn[qi++];try{k?playH(x):playN(x)}catch(e){console.error('[PromoMixer] note',e)}
    if((((performance&&performance.now)?performance.now():Date.now())-t0)>10)return false}
   return true};
  const flushAll=why=>{if(flushed)return PENDING;flushed=true;
   if(onHide){try{document.removeEventListener('visibilitychange',onHide);PBCSTAT.visRemove++}catch(e){}onHide=null}
   if(wd){clearTimeout(wd);PBCSTAT.watchCleared++;wd=null}
   if(why)try{console.log('[PromoMixer] scheduling the rest of this bed in slices ('+why+')')}catch(e){}
   PENDING=(async()=>{let n=0;
     while(!slice()){n++;PBCSTAT.yields++;await yieldTask();if(n>20000)break}
     Qn.length=0;
     flushDone=true;wake()})();
   return PENDING};
  const hidden=typeof document!=='undefined'&&document.hidden;
  if(hidden)flushAll('panel hidden');
  else{
   onHide=()=>{if(document.hidden)flushAll('panel hidden mid-render')};
   try{document.addEventListener('visibilitychange',onHide);PBCSTAT.visAdd++}catch(e){}
   for(let w=1;w<L-.2;w++){const at=Math.round((w-.05)*SR/128)*128/SR;
    C.suspend(at).then(()=>{if(flushed){if(flushDone)wake();return}sched(w+1.1);wake()},()=>{flushAll('suspend rejected')})}
   wd=setTimeout(()=>flushAll('render stalled'),Math.max(20000,L*1600));PBCSTAT.watchSet++;
  }
  CLEANUP.push(()=>{if(onHide){try{document.removeEventListener('visibilitychange',onHide);PBCSTAT.visRemove++}catch(e){}onHide=null}if(wd){clearTimeout(wd);PBCSTAT.watchCleared++;wd=null}});
 }
 // interplay: reverb returns dip 3 dB while the lead plays; chord instruments clear 250 Hz on each bass note
 {const st=.025,Nn=Math.ceil(L/st)+1,act=new Float32Array(Nn);for(const n of c.notes)if(n.r.name=='lead'){for(let i=Math.floor(n.t/st);i<Math.min(Nn,(n.t+n.dur)/st);i++)act[i]=1}let e=0;const cv2=new Float32Array(Nn);for(let i=0;i<Nn;i++){const tg=act[i]?1:0;e+=(tg-e)*(tg>e?.5:.08);cv2[i]=e}const vact=new Float32Array(Nn);if(A.act&&A.act.length){const hh=A.actHop||.05;let ee=0;for(let i=0;i<Nn;i++){const tt=i*st-c.offset,v=tt<0||tt>=A.len?0:A.act[Math.min(A.act.length-1,Math.floor(tt/hh))]||0;ee+=(v-ee)*(v>ee?.3:.05);vact[i]=ee}}for(const g of FXD)g.gain.value=1;for(const[g,d]of VDK)g.gain.setValueCurveAtTime(vact.map(x=>1-d*x),0,L);for(const[g,lv]of RET)g.gain.setValueCurveAtTime(cv2.map(x=>lv*(1-.29*x)),0,L);
  const bt=c.notes.filter(n=>n.r.name=='bass').map(n=>n.t);for(const d of DIPS)for(const t of bt){d.gain.setValueAtTime(0,Math.max(0,t-.005));d.gain.linearRampToValueAtTime(-2,t+.012);d.gain.setTargetAtTime(0,t+.03,.12)}}
 if(PENDING)try{await PENDING}catch(e){}
 STARTED=true;PBCSTAT.ctxStarted++;
 try{return await C.startRendering()}finally{STARTED=false;for(const fn of CLEANUP)try{fn()}catch(e){}CLEANUP.length=0;PENDING=null;PBCSTAT.ctxDone++}};
 let BAL={g:{},cut:{}};const CHAN={};
 if(SN.length>1){onStep&&onStep('Balancing '+SN.length+' parts');try{BAL=balance(await graph(false),SN,S)}catch(e){console.warn('balance',e)}}
 onStep&&onStep('Rendering the mix');const raw=await graph(true,BAL);onStep&&onStep('Mastering');const out=await master(raw,M2);c.meta.mix={g:BAL.g,lv:BAL.lv,want:BAL.want,cut:BAL.cut};Object.assign(c.meta.song,{pump:+(S.pump||0).toFixed(2),width:+M2.side.toFixed(2),warmth:+M2.sat.toFixed(2),air:+M2.air.toFixed(1),glue:+clamp((-8-M2.glue[0])/20,0,1).toFixed(2),loud:+M2.loud.toFixed(1),low:(o.song||{}).low||0,lowmid:(o.song||{}).lowmid||0,mid:(o.song||{}).mid||0,presence:(o.song||{}).presence||0,high:(o.song||{}).high||0,feel:(o.song||{}).feel??1,art:(o.song||{}).art??1,variety:(o.song||{}).variety??1,varied:S.varied||null,blendStyle:(o.song||{}).blendStyle??.6,slots:S.slots||null,expr:(o.song||{}).expr??1,depth:(o.song||{}).depth??1,hrtf:(o.song||{}).hrtf??0,midDip:(o.song||{}).midDip??2,maxParts:(o.song||{}).maxParts??7,thin:(o.song||{}).thin??1,tame:(o.song||{}).tame??1,tameAt:(o.song||{}).tameAt??0,harm:(o.song||{}).harm??1,rr:(o.song||{}).rr??1,drift:M2.drift,monoHz:M2.monoHz,subHz:M2.subHz,pocket:M2.pocket,endCap:M2.endCap,vWeight:M2.vW});c.meta.chan=CHAN;c.meta.detail&&(c.meta.detail.mixBalance=c.meta.mix,c.meta.detail.master=M2,c.meta.detail.channels=CHAN);c.meta.nNotes=[c.notes.length,c.hits.length];
 return{buffer:out,offset:c.offset,meta:c.meta,piece:o.piece}}

// ---- subgenres: each one inherits a parent genre and overrides only what makes it itself ----
const SUBG=[["powerpop","Power Pop","drivepop","118-152","","bright","pop","eguitar","","push","","Chiming guitars, big hooks, hand-clap energy"],["citypop","City Pop","drivepop","98-118","","jazz","soul","epiano,sax,brass","","laid",0.12,"Glossy 80s Tokyo pop: Rhodes, slap bass, bright horns"],["yachtrock","Yacht Rock","soul","96-112","","jazz","soul","epiano,eguitar,sax","","laid",0.1,"Smooth 70s studio pop, lush chords, clean guitar"],["britpop","Britpop","indie","112-136","","pop","pop","eguitar,organ","","push","","Swaggering guitars and singalong changes"],["shoegaze","Shoegaze","indie","98-124","","triad","modal","eguitar,synpad","","","","Washed guitar haze over a steady pulse"],["dreampop","Dream Pop","indie","88-112","","triad","ambient","synpad,eguitar","","","","Soft-focus chords, slow bloom, gentle motion"],["jangle","Jangle Pop","indie","120-144","","bright","folk","eguitar,acguitar","","push","","Bright twelve-string ring and brisk strumming"],["garage","Garage Rock","drivepop","130-162","","triad","folk","eguitar,organ","strings,harp","push","","Raw, fuzzy, driving and short on polish"],["postpunk","Post-Punk","synthpop","132-158","min","triad","modal","eguitar,ebass","","push","","Taut bass, chiming angular guitar, cold edge"],["newwave","New Wave","synthpop","124-148","","bright","pop","synth,eguitar,organ","","push","","Skinny-tie synths and bouncing eighth notes"],["sunshine","Sunshine Pop","campfire","104-124","","bright","pop","acguitar,vibes,harp,flute","","lilt","","Sunny 60s harmony pop, airy and warm"],["bubblegum","Bubblegum Pop","drivepop","124-146","","bright","pop","organ,eguitar","","push","","Simple, relentlessly cheerful hooks"],["stadium","Stadium Rock","epic","118-140","","triad","anthem","eguitar,organ","","push","","Wide guitars, four-on-the-floor lift, big ending"],["heartland","Heartland Rock","americana","112-132","","triad","pop","eguitar,organ,piano","","push","","Open-road rock with piano and ringing guitar"],["softrock","Soft Rock","soul","86-104","","pop","soul","epiano,acguitar,strings","","laid","","Warm, unhurried 70s radio warmth"],["baroquepop","Baroque Pop","chamber","96-120","","triad","pop","harpsi,strings,harp,woodwind","","","","Pop shapes played by a small classical band"],["artpop","Art Pop","brooklyn","98-126","","cine","modal","piano,strings,synpad","","","","Pop built from unusual colours and shapes"],["chamberpop","Chamber Pop","chamber","92-116","","cine","pop","strings,piano,woodwind,harp","","","","Orchestral pop: strings, winds, tender piano"],["mathrock","Math Rock","brooklyn","126-150","","triad","modal","eguitar","","push","","Interlocking odd phrases and clean tapped guitar"],["postrock","Post-Rock","cinematic","96-128","","triad","ambient","eguitar,synpad","","","","Slow builds from a whisper to a wall"],["progressivehouse","Progressive House","house","122-128","","triad","ambient","","","tight","","Long builds, rolling bass, wide pads"],["techhouse","Tech House","house","122-128","","triad","modal","","piano,strings","tight","","Stripped groove, bumping bass, dry drums"],["garagehouse","Garage House","house","120-126","","soul","gospel","epiano,organ","","laid",0.08,"Soulful chords, swung hats, gospel changes"],["frenchhouse","French House","house","118-126","","jazz","soul","epiano,eguitar","","tight","","Filtered disco loops and talk-box funk"],["disco","Disco","funk","110-124","","jazz","soul","strings,brass,eguitar,epiano","","push","","Four-on-the-floor strings, octave bass, open hats"],["nudisco","Nu-Disco","house","112-122","","jazz","soul","eguitar,epiano,brass","","push","","Modern disco sheen with a club bottom"],["italodisco","Italo Disco","synthwave","116-128","","bright","pop","synth","","tight","","Arpeggiated synths, naive melody, neon shine"],["eurodance","Eurodance","electronic","132-142","","bright","anthem","synth,piano","","tight","","Hands-in-the-air hooks over a hard four-floor"],["hardhouse","Hard House","techno","136-148","","triad","modal","","","tight","","Pounding kick, stabbing offbeats, siren riffs"],["minimaltechno","Minimal Techno","techno","124-132","","triad","modal","","","tight","","Tiny parts, huge space, hypnotic repetition"],["detroittechno","Detroit Techno","techno","122-132","","jazz","modal","synpad,epiano","","tight","","Soulful machine funk with strings of chord stabs"],["dubtechno","Dub Techno","techno","118-126","min","triad","ambient","synpad","","","","Chords echoing into fog over a soft kick"],["acidhouse","Acid House","house","118-128","","triad","modal","","strings","tight","","Squelching 303 line and raw drum machine"],["breakbeat","Breakbeat","dnb","128-140","","triad","pop","synbass","","push","","Chopped funk break under rave stabs"],["ukgarage","UK Garage","house","128-136","","soul","soul","epiano,organ","","laid",0.14,"Shuffled two-step with clipped vocal-style stabs"],["jungle","Jungle","dnb","160-174","","triad","modal","synbass,sub","","push","","Frantic chopped breaks over a vast sub"],["neurofunk","Neurofunk","dnb","172-176","min","triad","modal","synbass","piano,strings","tight","","Metallic reese bass and surgical drums"],["liquidfunk","Liquid Funk","dnb","170-176","","soul","soul","epiano,strings,sax","","tight","","Rolling breaks under warm soulful chords"],["psytrance","Psytrance","trance","138-146","min","triad","modal","","piano","tight","","Rolling triplet bass and twisting acid lines"],["uplifting","Uplifting Trance","trance","136-142","","bright","anthem","piano,strings","","tight","","Huge emotional breakdown into a soaring lead"],["bigbeat","Big Beat","breakbeat","118-136","","triad","pop","brass,organ","","push","","Fat breaks, filtered riffs, swagger"],["electroswing","Electro Swing","house","110-128","","jazz","jazz","brass,sax,piano","","laid",0.3,"Vintage swing samples over a modern four-floor"],["chillwave","Chillwave","downtempo","96-116","","triad","ambient","synpad,synth","","","","Sun-bleached synths and hazy nostalgia"],["vaporwave","Vaporwave","downtempo","70-90","","jazz","soul","epiano,synpad","","laid","","Slowed mall-music glow, wobbling and warm"],["synthwaveout","Outrun","synthwave","98-118","","bright","pop","synth,synbass","","tight","","Neon highway arpeggios and gated drums"],["darksynth","Darksynth","synthwave","100-120","min","triad","modal","synth,synbass","","tight","","Menacing analog leads over driving pulses"],["idm","IDM","downtempo","90-120","","cine","modal","synpad,synth,mallet","","","","Fractured rhythms and delicate melodic cells"],["glitch","Glitch","downtempo","96-124","","triad","modal","synth,mallet","","tight","","Stuttering edits and granular textures"],["trip","Trip-Hop","downtempo","78-94","min","jazz","lofi","epiano,strings,sax","","laid",0.1,"Dusty break, deep bass, cinematic gloom"],["dubstep","Dubstep","futurebass","138-142","min","triad","modal","synbass,sub","piano","tight","","Half-time beat under growling wobble bass"],["futuregarage","Future Garage","downtempo","128-136","min","triad","ambient","synpad,epiano","","laid",0.12,"Shuffled ghostly garage under soft pads"],["ambienttechno","Ambient Techno","techno","118-126","","triad","ambient","synpad","","tight","","Pulsing machine calm, almost beatless"],["drone","Drone","ambient","56-72","min","triad","ambient","synpad,glass,strings","","","","One slow-moving cloud of sustained tone"],["newage","New Age","meditation","60-80","","triad","ambient","harp,synpad,flute,glass","","","","Serene harp and pad washes, gentle bells"],["berlin","Berlin School","synthwave","94-116","min","triad","modal","synth,synpad","","tight","","Long sequencer patterns evolving slowly"],["boombap","Boom Bap","lofi","84-96","","jazz","lofi","epiano,upright,sax,vibes","","laid",0.1,"Dusty swung drums and jazzy loops"],["trapsoul","Trap Soul","soul","66-76","min","soul","soul","epiano,synpad,sub","","laid","","Sparse half-time knock under smoky chords"],["gfunk","G-Funk","funk","90-102","","funk","soul","synth,epiano,ebass","","laid","","Lazy high synth lead over rolling funk bass"],["neosoulgroove","Neo-Soul Groove","soul","78-92","","jazz","soul","epiano,eguitar,upright","","laid",0.14,"Loose pocket, rich extended chords"],["quietstorm","Quiet Storm","soul","68-84","","jazz","soul","epiano,sax,strings","","laid","","Late-night smooth soul, sax and warm pads"],["motown","Motown","soul","112-132","","pop","soul","brass,vibes,eguitar,piano","","push","","Tambourine backbeat, bright horns, walking bass"],["stax","Southern Soul","soul","96-116","","soul","gospel","organ,brass,eguitar","","laid","","Gritty horns, Hammond, in-the-pocket drums"],["philly","Philly Soul","soul","104-118","","jazz","soul","strings,harp,brass,epiano","","push","","Sweeping strings over a silky rhythm section"],["funkrock","Funk Rock","funk","104-124","","funk","funk","eguitar,organ,brass","","push","","Slapping bass and biting rhythm guitar"],["pfunk","P-Funk","funk","96-112","","funk","funk","synth,brass,organ","","laid","","Loose cosmic funk with squelchy synths"],["afrobeat","Afrobeat","funk","104-124","","funk","modal","brass,organ,eguitar","","lilt","","Interlocking guitars, horn riffs, long grooves"],["afrobeats","Afrobeats","drivepop","100-112","","pop","pop","synth,epiano,kalimba","","lilt","","Lilting log-drum pulse and bright hooks"],["highlife","Highlife","world","104-124","","bright","folk","eguitar,brass,acguitar","","lilt","","Sweet interlaced guitars with horn answers"],["soukous","Soukous","world","126-146","","bright","pop","eguitar,brass","","lilt","","Fast rippling guitars over a driving beat"],["amapiano","Amapiano","deephouse","110-116","","jazz","soul","epiano,piano,sub","","laid",0.1,"Log-drum bass, airy keys, shuffling percussion"],["gqom","Gqom","techno","122-128","min","triad","modal","sub,synbass","piano,strings","tight","","Raw broken four-floor with cavernous drums"],["bebop","Bebop","jazz","180-240","","jazz","jazz","sax,brass,upright,piano","","push",0.3,"Fast heads, walking bass, brushed ride"],["cooljazz","Cool Jazz","jazz","108-132","","jazz","jazz","sax,brass,vibes,upright","","laid",0.26,"Understated, airy, relaxed phrasing"],["hardbop","Hard Bop","jazz","136-176","","jazz","jazz","sax,brass,piano,upright","","push",0.3,"Blues-soaked bop with punchy horns"],["modaljazz","Modal Jazz","jazz","108-144","","jazz","modal","sax,piano,upright","","laid",0.24,"Few chords, wide open soloing space"],["jazzfusion","Jazz Fusion","funk","112-140","","jazz","modal","epiano,synth,eguitar","","push","","Electric keys and virtuoso funk complexity"],["gypsyjazz","Gypsy Jazz","jazz","160-220","","jazz","jazz","acguitar,strsolo,upright","epiano,synth","push",0.3,"Pumping acoustic rhythm and hot violin leads"],["swingbig","Big Band Swing","jazz","140-200","","jazz","jazz","brass,sax,piano,upright","","push",0.33,"Full horn sections trading punches"],["dixieland","Dixieland","jazz","156-208","","jazz","folk","brass,sax,acguitar,upright","","push",0.28,"Collective front-line polyphony, two-beat bass"],["smoothjazz","Smooth Jazz","soul","92-110","","jazz","soul","sax,epiano,eguitar","","laid",0.1,"Polished sax lead over silky keys"],["jazzwaltz","Jazz Waltz","jazz","120-160","","jazz","jazz","piano,upright,sax","","lilt",0.28,"Lilting three-feel with brushed drums"],["nouveau","Nouveau Flamenco","spanish","104-128","","triad","flamenco","acguitar,ebass","","lilt","","Flamenco fire with a modern rhythm section"],["salsa","Salsa","bossa","180-210","","jazz","soul","brass,piano,upright","","push","","Montuno piano, clave, blazing horn lines"],["sonmontuno","Son Montuno","bossa","150-180","","jazz","folk","piano,brass,upright,acguitar","","lilt","","Cuban son: tres-like guitar and clave"],["bolero","Bolero","bossa","72-92","","jazz","soul","acguitar,strings,piano","","laid","","Slow romantic Latin ballad with lush guitar"],["chacha","Cha-Cha-Ch\u00e1","bossa","112-128","","jazz","soul","brass,piano,flute","","push","","Bright syncopated Latin dance step"],["mambo","Mambo","bossa","180-210","","jazz","soul","brass,sax,piano","","push","","Big-band Latin with stabbing brass"],["samba","Samba","bossa","96-108","","jazz","bossa","acguitar,brass,piano","","lilt","","Rolling surdo pulse and cu\u00edca-bright percussion"],["mpb","MPB","bossa","88-104","","jazz","bossa","acguitar,piano,flute,strings","","lilt","","Brazilian songcraft: warm nylon and soft brushes"],["choro","Choro","bossa","124-152","","jazz","folk","acguitar,flute,woodwind","","push","","Virtuoso interwoven lines over a walking bass"],["tango","Tango","chamber","108-128","min","jazz","modal","strsolo,piano,upright,harmonica","","push","","Dramatic staccato bite and sweeping rubato"],["cumbia","Cumbia","world","88-104","","triad","folk","acguitar,brass,organ","","lilt","","Loping two-step with bright guitar and horns"],["reggaeton","Reggaet\u00f3n","reggae","90-100","min","pop","pop","synth,sub,synbass","vibes","push","","Dembow bounce with sharp synth hooks"],["dancehall","Dancehall","reggae","96-108","","pop","pop","synth,organ,sub","","push","","Sparse riddim with a hard digital bounce"],["dubreggae","Dub","reggae","68-82","","triad","modal","organ,epiano","","laid",0.1,"Bass and drums drenched in echo and space"],["rootsreggae","Roots Reggae","reggae","68-80","","triad","modal","organ,eguitar,brass","","laid","","One-drop groove, skank guitar, deep message bass"],["ska","Ska","reggae","150-190","","bright","pop","brass,organ,eguitar","","push","","Fast upstroke guitar and jumping horn lines"],["rocksteady","Rocksteady","reggae","78-92","","soul","soul","organ,eguitar,brass","","laid","","Slower, sweeter soul-inflected island groove"],["calypsoc","Calypso","steelpan","112-132","","bright","folk","acguitar,brass","","lilt","","Lilting island swing with bright pan and horns"],["soca","Soca","steelpan","136-160","","bright","pop","brass,synth","","push","","Fast carnival drive and relentless percussion"],["oldtime","Old-Time","bluegrass","108-132","","triad","folk","folkpluck,strsolo,acguitar","","lilt","","Clawhammer banjo and fiddle in lockstep"],["newgrass","Newgrass","bluegrass","112-144","","jazz","folk","folkpluck,acguitar,strsolo,upright","","push","","Bluegrass instruments with jazz harmony"],["countryballad","Country Ballad","americana","68-88","","triad","folk","acguitar,strsolo,piano","","laid","","Slow sway, weeping fiddle, simple truth"],["honkytonk","Honky-Tonk","americana","120-146","","triad","folk","piano,eguitar,strsolo","","push","","Barroom piano, shuffle beat, twanging guitar"],["bakersfield","Bakersfield","americana","124-150","","triad","folk","eguitar,strsolo","","push","","Sharp Telecaster twang and driving backbeat"],["outlaw","Outlaw Country","americana","96-124","","triad","folk","eguitar,acguitar,organ","","push","","Lean, dusty, unvarnished country swagger"],["westernswing","Western Swing","americana","152-196","","jazz","jazz","strsolo,eguitar,piano,upright","","push",0.3,"Country band playing hot swing"],["appalachian","Appalachian","folk","96-124","","triad","modal","folkpluck,strsolo,acguitar","","lilt","","Modal mountain tunes and drone strings"],["seashanty","Sea Shanty","folk","88-112","min","triad","modal","acguitar,folkpluck,harmonica","","lilt","","Rolling call-and-response work song"],["irishtrad","Irish Trad","celtic","108-132","","triad","modal","folkpluck,strsolo,flute,harp","","lilt","","Reels and jigs with fiddle and flute"],["scottish","Scottish Folk","celtic","96-128","","triad","modal","strsolo,harp,flute","","lilt","","Strathspey snap and highland modal colour"],["klezmer","Klezmer","world","120-168","min","jazz","modal","woodwind,brass,strsolo","","push","","Wailing clarinet over driving freylekhs"],["balkan","Balkan Brass","world","132-180","min","triad","modal","brass,woodwind","","push","","Raucous brass band at breakneck speed"],["fado","Fado","classicalguitar","72-92","min","triad","modal","acguitar,strsolo","","rubato","","Aching Portuguese lament on twinned guitars"],["flamencopuro","Flamenco Puro","spanish","96-136","min","triad","flamenco","acguitar","piano,synth","lilt","","Just guitar, palmas and comp\u00e1s"],["andean","Andean","world","96-124","min","triad","modal","flute,folkpluck,acguitar","","lilt","","Breathy panpipe-style flute over charango strum"],["gamelanish","Gamelan Colours","eastasian","84-112","","triad","modal","mallet,glass","","lilt","","Interlocking bronze-toned mallet cycles"],["indianraga","Raga Mood","eastasian","64-96","min","triad","modal","world,flute,strsolo","","rubato","","Drone-anchored modal melody, free opening"],["taiko","Taiko Drive","world","104-132","min","triad","modal","flute,mallet","","push","","Thundering drum patterns and sparse flute"],["koto","East Asian Court","eastasian","64-88","","triad","modal","world,flute,harp","","rubato","","Plucked zither and flute in open space"],["arabicmaqam","Maqam Mood","world","88-124","min","triad","modal","world,woodwind,strsolo","","lilt","","Modal Middle Eastern melody over frame drums"],["mediterranean","Mediterranean","world","104-128","","triad","folk","acguitar,mallet,flute","","lilt","","Sunlit strings and hand percussion"],["polka","Polka","world","112-144","","bright","folk","brass,harmonica,acguitar","","push","","Oom-pah bounce with bright accordion-style reeds"],["zydeco","Zydeco","americana","128-156","","bright","folk","harmonica,eguitar,organ","","push","","Washboard shuffle and squeezebox drive"],["hawaiian","Hawaiian","campfire","88-112","","triad","folk","acguitar,folkpluck,strsolo","","lilt","","Slack-key warmth and gentle sway"],["bluesdelta","Delta Blues","americana","76-104","","triad","folk","acguitar,harmonica","strings,synpad","laid",0.2,"Lone slide guitar and harmonica moan"],["chicagoblues","Chicago Blues","americana","96-128","","triad","folk","eguitar,harmonica,organ,piano","","laid",0.18,"Amplified shuffle with stinging guitar"],["jumpblues","Jump Blues","jazz","144-184","","jazz","folk","brass,sax,piano,upright","","push",0.3,"Shouting horns over a boogie bass"],["gospelchoir","Gospel","church","76-104","","gospel","gospel","organ,piano,brass","","laid","","Rolling organ, big plagal lifts, hand claps"],["spiritual","Spiritual","church","64-84","","gospel","gospel","organ,piano,strings","","rubato","","Slow, devotional, deeply resonant"],["renaissance","Renaissance","baroque","88-116","","triad","modal","harpsi,flute,woodwind,harp","","lilt","","Consort textures, modal cadences, recorders"],["classicalera","Classical Era","chamber","96-132","","triad","folk","piano,strings,woodwind","","push","","Clean classical phrasing and clear cadences"],["romantic","Romantic","cinematic","72-104","","cine","cine","piano,strings,brass,harp","","rubato","","Surging strings and heart-on-sleeve rubato"],["impressionist","Impressionist","ambient","64-92","","cine","ambient","piano,harp,woodwind,strings","","rubato","","Floating whole-tone colour and soft pedalling"],["minimalism","Minimalism","brooklyn","104-136","","triad","modal","piano,mallet,strings,woodwind","","tight","","Repeating cells shifting slowly out of phase"],["neoclassical","Neoclassical Piano","cellosolo","64-88","","cine","ambient","piano,strings","","rubato","","Intimate felt piano with soft string bloom"],["stringquartet","String Quartet","chamber","84-116","","triad","folk","strings,strsolo","piano,synpad,brass,woodwind,flute,harpsi,mallet,harp","","","Four voices in close conversation"],["organfugue","Organ Fugue","church","96-124","min","triad","modal","organ","strings,strsolo,brass,bowbass","push","","Interlocking voices on a single great organ"],["operatic","Operatic","cinematic","68-96","","cine","cine","strings,brass,harp,woodwind","","rubato","","Grand orchestral sweep and dramatic pauses"],["waltzvienna","Viennese Waltz","chamber","152-184","","triad","folk","strings,harp,woodwind","","lilt","","Lilting three-feel with an elegant lift"],["marchband","Concert March","epic","108-124","","bright","anthem","brass,woodwind","","push","","Crisp brass band pomp and snare rolls"],["fanfare","Fanfare","epic","96-132","","bright","anthem","brass","","push","","Short heraldic brass statements"],["lullaby","Lullaby","meditation","56-76","","triad","folk","glass,harp,piano,flute","","rubato","","Hushed rocking motion, music-box sweetness"],["musicbox","Music Box","meditation","72-96","","triad","folk","mallet,glass,harp","","lilt","","Tiny plucked bells and a wind-up sway"],["trailer","Trailer","epic","84-116","min","cine","epic","brass,strings,sub","","push","","Rising hits, braams and a hard final stab"],["heroic","Heroic Theme","epic","104-132","","bright","anthem","brass,strings","","push","","Noble horn theme over driving strings"],["mystery","Mystery","cinematic","72-100","min","cine","modal","strings,harp,glass,woodwind","","rubato","","Questioning fragments and uneasy stillness"],["thriller","Thriller","cinematic","104-136","min","cine","modal","strings,sub,synpad","","tight","","Pulsing ostinato tightening under the read"],["noir","Film Noir","jazz","76-104","min","jazz","modal","sax,brass,piano,upright","","laid",0.18,"Smoky late sax over brushed drums"],["westernfilm","Spaghetti Western","americana","88-120","min","triad","modal","eguitar,brass,harmonica,flute","","push","","Twanging guitar, lonely whistle-like lead"],["spacedoc","Space Documentary","ambient","60-84","","cine","ambient","synpad,glass,strings,piano","","rubato","","Vast slow wonder and glittering detail"],["naturedoc","Nature Documentary","cinematic","72-104","","cine","folk","strings,harp,woodwind,piano,flute","","rubato","","Gentle curiosity with warm orchestral light"],["newsbed","News Bed","epic","108-132","","triad","anthem","brass,synth,strings","","tight","","Urgent, neutral, driving under speech"],["sportsbed","Sports Bed","epic","124-148","","bright","anthem","brass,eguitar,synth","","push","","Big, punchy, relentless forward motion"],["corporate","Corporate Uplift","anthem","108-128","","bright","pop","piano,mallet,synpad","","push","","Clean optimistic build with plucky piano"],["techexplain","Tech Explainer","brooklyn","104-124","","triad","pop","mallet,synth,piano","","tight","","Tidy marimba-like pulse, friendly and clear"],["podcastbed","Podcast Bed","lofi","84-100","","jazz","lofi","epiano,upright,vibes","","laid",0.1,"Low-key loop that stays out of the way"],["comedy","Comedy Light","campfire","112-140","","bright","folk","mallet,acguitar,woodwind","","lilt","","Playful plucks and winking woodwinds"],["quirky","Quirky","brooklyn","112-140","","bright","folk","mallet,harpsi,woodwind","","lilt","","Odd little steps and bright toy colours"],["dramatic","Dramatic Reveal","cinematic","64-92","min","cine","cine","strings,piano,brass,sub","","rubato","","Held breath, then a full orchestral open"],["retro8bit","Chiptune","synthpop","124-156","","bright","pop","synth","strings,harp","tight","","Square-wave melodies and tiny arpeggios"],["circus","Circus","world","128-164","","bright","folk","brass,organ,woodwind","","push","","Galloping oom-pah and gleeful brass"],["horror","Horror","cinematic","60-96","min","cine","modal","strings,glass,sub,piano","","rubato","","Scraping tremolo, dread and silence"],["dreamsequence","Dream Sequence","ambient","60-88","","cine","ambient","harp,glass,synpad,strings","","rubato","","Blurred harp and bell shimmer"],["meditationdeep","Deep Meditation","meditation","52-68","","triad","ambient","glass,synpad,harp","","rubato","","Almost motionless, long bowl-like tones"],["yoga","Yoga Flow","meditation","64-84","","triad","ambient","flute,harp,glass,kalimba","","rubato","","Breathing pulse with soft flute and bells"],["spa","Spa","ambient","56-76","","triad","ambient","harp,glass,synpad,flute","","rubato","","Water-soft pads and distant chimes"],["focus","Focus Loop","downtempo","96-116","","triad","ambient","mallet,synpad,epiano","","tight","","Even, unobtrusive, quietly propulsive"],["sleep","Sleep","ambient","48-64","","triad","ambient","synpad,glass","","rubato","","Barely moving warmth for drifting off"]];
for(const[id,n,par,bpm,modes,color,prog,add,drop,feel,sw,d]of SUBG){const P0=G[par];if(!P0||G[id])continue;
 const g={...P0,n,d:d||P0.d,roles:{...P0.roles},bands:P0.bands.map(b=>({...b})),mix:{...P0.mix},master:{...P0.master},modes:{...P0.modes},bpm:P0.bpm.slice(),parent:par};
 if(bpm){const[a,b]=bpm.split('-').map(Number);g.bpm=[a,b]}
 if(modes)g.modes=Object.fromEntries(modes.split(',').map(m=>[m,1]));
 if(color)g.color=color;if(prog&&PROGS[prog])g.prog=prog;if(sw!=='')g.sw=+sw;if(feel)g.feelHint=feel;
 G[id]=g;
 const fam=new Set(GFAM[par]||[]);if(add)for(const f of add.split(','))fam.add(f);if(drop)for(const f of drop.split(','))fam.delete(f);
 GFAM[id]=[...fam];g.fav=add?add.split(','):[];
 {const sg={...(SIG[par]||{})},ROLEFOR={sax:'lead',brass:'lead',flute:'lead',woodwind:'lead',harmonica:'lead',strsolo:'lead',world:'lead',synth:'lead',
   organ:'keys',epiano:'keys',piano:'keys',harpsi:'keys',acguitar:'keys',eguitar:'pulse',folkpluck:'pulse',mallet:'pulse',kalimba:'pulse',vibes:'keys',harp:'keys',glass:'pad',strings:'pad',synpad:'pad',
   ebass:'bass',upright:'bass',synbass:'bass',sub:'bass',bowbass:'bass'},taken={};
  for(const f of g.fav){const rn=ROLEFOR[f];if(!rn||taken[rn])continue;taken[rn]=1;sg[rn]=[f]}
  if(Object.keys(sg).length)SIG[id]=sg}
 if(PROGS[prog]&&!g.prog)g.prog=prog}
const GORD=['campfire','drivepop','brooklyn','anthem','funk','epic','electronic','house','deephouse','techno','trance','synthwave','futurebass','dnb','downtempo'],GENRES=[...GORD,...Object.keys(G).filter(k=>!GORD.includes(k))].map(k=>({id:k,name:G[k].n,desc:G[k].d}));
window.PBC={stat:()=>Object.assign({},PBCSTAT),yield:yieldTask,mem:()=>({cacheMB:+(cacheBytes/1048576).toFixed(1),cachedNotes:cache.size,banks:banks.size}),grooves:Object.keys(GROOVES),kits:['studio','pi','hand','orch','tabla','tr808','tr909','tr707','dmx','sp12','linn9k','cr78','tr606'],render,analyze,GENRES,G,ADJ,INS,SIG,GFAM,blendG,pickPiece,pickAny,abcToPiece,sessionTunes,session:()=>SESS?SESS.length:0,loadSessionFile:sessionFromFile,preloadSession:()=>{if(!LIBI)libJSON('index.json').then(x=>{LIBI=x}).catch(()=>{});return sessionTunes().catch(e=>{console.warn('[PromoMixer] The Session tunes unavailable',e);return null})},_compose:compose};
})();
