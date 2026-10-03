(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const card=$('card'), party=$('party'), invitation=$('invitation'), cake=$('cake');
  const pika=$('pika'), pichu=$('pichu'), caption=$('caption');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=$('confetti'), ctx=canvas.getContext('2d');
  let timers=[], frame=0, particles=[], running=false, audio=null, soundOn=false;
  let w=0,h=0,last=0, notes=[];
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  function stop(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(frame);frame=0;particles=[];if(ctx)ctx.clearRect(0,0,w,h);notes.forEach(n=>{try{n.stop()}catch{}});notes=[];}
  function resize(){const rect=card.getBoundingClientRect();w=rect.width;h=rect.height;const d=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);if(ctx)ctx.setTransform(d,0,0,d,0,0);}
  function burst(count=100){if(!ctx||reduced.matches)return;resize();const colors=['#ec91aa','#b3a0d7','#e4bd6e','#f5ccb3','#fff8e6'];for(let i=0;i<count;i++){const left=i%2===0;particles.push({x:left?w*.08:w*.92,y:h*.57,vx:(left?1:-1)*(90+Math.random()*160),vy:-180-Math.random()*260,age:0,life:2.2+Math.random()*1.7,size:3+Math.random()*5,angle:Math.random()*6,spin:(Math.random()-.5)*8,color:colors[i%colors.length],round:i%5===0});}if(!frame){last=performance.now();frame=requestAnimationFrame(paint)}}
  function paint(now){const dt=Math.min((now-last)/1000,.04);last=now;ctx.clearRect(0,0,w,h);particles=particles.filter(p=>p.age<p.life);for(const p of particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=210*dt;p.vx*=Math.pow(.98,dt*60);p.angle+=p.spin*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.min(1,(p.life-p.age)*1.3);ctx.fillStyle=p.color;if(p.round){ctx.beginPath();ctx.arc(0,0,p.size/2,0,Math.PI*2);ctx.fill()}else ctx.fillRect(-p.size/2,-p.size,p.size,p.size*1.6);ctx.restore()}frame=particles.length?requestAnimationFrame(paint):0;}
  function tune(){if(!soundOn||!audio)return;const seq=[[523,0,.12],[659,.16,.12],[784,.32,.2],[659,.62,.12],[784,.8,.12],[1047,1,.4]];for(const [freq,delay,len] of seq){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;const t=audio.currentTime+delay;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.07,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+len+.02);notes.push(o)}}
  function ready(){pika.classList.remove('bow','speaking');pichu.classList.remove('bow','speaking','oops');card.classList.remove('bowing','closed-out');card.dataset.state='ready';caption.textContent='';running=false;}
  function reveal(){invitation.hidden=true;party.hidden=false;party.classList.add('party-enter');$('greeting').focus({preventScroll:true});card.classList.remove('closed-out');card.classList.add('arriving');resize();if(reduced.matches){card.classList.add('served');cake.classList.add('lit');ready();return;}
    later(()=>{card.classList.add('served');caption.textContent='케이크도 정성껏 모셨습니다.'},1250);
    later(()=>{cake.classList.add('lit');tune()},2250);
    later(()=>{pika.classList.add('speaking');caption.textContent='그리고… 큰절 올립니다.'},3000);
    later(()=>{pika.classList.add('bow');card.classList.add('bowing')},3900);
    later(()=>{pichu.classList.add('oops','speaking')},4250);
    later(()=>{pichu.classList.remove('oops');pichu.classList.add('bow')},4750);
    later(()=>{pika.classList.remove('bow','speaking');pichu.classList.remove('bow','speaking');card.classList.remove('bowing');card.classList.add('celebrating');caption.textContent='박자는 달라도 축하는 진심입니다 ㅋㅋ';burst();tune()},6400);
    later(()=>burst(55),7450);later(ready,9000);
  }
  function start(first=false){stop();running=true;card.dataset.state='playing';card.classList.remove('arriving','served','bowing','celebrating');party.classList.remove('party-enter');pika.classList.remove('bow','speaking');pichu.classList.remove('bow','speaking','oops');cake.classList.remove('lit');caption.textContent='축하단 입장합니다.';$('share-status').textContent='';void card.offsetWidth;if(first&&!reduced.matches){card.classList.add('closed-out');later(reveal,480)}else reveal();}
  $('enter').addEventListener('click',()=>{if(!running)start(true)});
  $('replay').addEventListener('click',()=>start());
  $('sound').addEventListener('click',async()=>{try{if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('unsupported');audio=new Audio()}await audio.resume();soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').textContent=soundOn?'♪ 소리 끄기':'♪ 소리 켜기';if(soundOn)tune();else{notes.forEach(n=>{try{n.stop()}catch{}});notes=[]}}catch{$('share-status').textContent='소리 없이도 파티는 계속됩니다.'}});
  $('share').addEventListener('click',async()=>{const url='https://pollmap.github.io/sojeong-birthday-card-2026/?v=2';try{await navigator.clipboard.writeText(url);$('share-status').textContent='링크를 복사했습니다.'}catch{$('share-status').textContent='주소창의 링크를 복사해 주세요.'}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(audio)audio.suspend().catch(()=>{});if(running){stop();pika.classList.remove('bow','speaking');pichu.classList.remove('bow','speaking','oops');invitation.hidden=true;party.hidden=false;card.classList.add('arriving','served');cake.classList.add('lit');ready();}cancelAnimationFrame(frame);frame=0;particles=[];if(ctx)ctx.clearRect(0,0,w,h)}else if(audio&&soundOn)audio.resume().catch(()=>{});});
  const motionChange=()=>{if(reduced.matches&&running){stop();invitation.hidden=true;party.hidden=false;card.classList.add('arriving','served');cake.classList.add('lit');ready();}};
  if(reduced.addEventListener)reduced.addEventListener('change',motionChange);else reduced.addListener(motionChange);
  window.addEventListener('resize',resize,{passive:true});window.addEventListener('pagehide',stop);resize();
})();
