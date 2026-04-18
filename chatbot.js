// chatbot.js

(function(){
  var PROXY_URL='https://us-central1-quick-event-coordinator.cloudfunctions.net/geminiProxy';
  var chatHistory=[];

  var fab=document.getElementById('ai-fab');
  var win=document.getElementById('ai-window');
  var closeBtn=document.getElementById('ai-close');
  var msgs=document.getElementById('ai-messages');
  var input=document.getElementById('ai-input');
  var sendBtn=document.getElementById('ai-send');

  fab.addEventListener('click',function(){
    win.classList.toggle('open');
    if(win.classList.contains('open')) input.focus();
  });
  closeBtn.addEventListener('click',function(){win.classList.remove('open')});

  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg()}
  });
  sendBtn.addEventListener('click',sendMsg);

  function buildContext(){
    if(!window.state||!window.state.eventKey) return 'המשתמש עדיין לא נכנס לאירוע. הוא נמצא במסך הבית.';
    var lines=['שם האירוע: '+window.state.eventName];
    var users=window.state.users||{};
    var avail=window.state.availability||{};
    var userNames={};
    Object.entries(users).forEach(function(e){userNames[e[0]]=e[1].name});
    var userList=Object.values(users).map(function(u){return u.name});
    lines.push('משתתפים: '+(userList.length>0?userList.join(', '):'אין'));

    var dates=Object.keys(avail).sort();
    var totalEntries=0;
    dates.forEach(function(d){ totalEntries += (avail[d]||[]).length; });

    if(dates.length===0){
      lines.push('עדיין אין זמינויות שהוזנו.');
    } else if(totalEntries <= 20){
      // Small event: show all details
      lines.push('זמינויות שהוזנו:');
      dates.forEach(function(d){
        var entries=avail[d];
        entries.forEach(function(en){
          var name=userNames[en.userId]||'?';
          var note=en.note?' ('+en.note+')':'';
          lines.push('  '+d+': '+name+note);
        });
      });
    } else {
      // Large event: summarize
      lines.push('סה\"כ '+totalEntries+' רשומות זמינות על פני '+dates.length+' ימים.');
      // Find best days
      var dayCounts=[];
      dates.forEach(function(d){
        dayCounts.push({date:d, count:(avail[d]||[]).length});
      });
      dayCounts.sort(function(a,b){return b.count-a.count});
      var top3=dayCounts.slice(0,3);
      lines.push('הימים עם הכי הרבה זמינויות:');
      top3.forEach(function(dc){
        lines.push('  '+dc.date+': '+dc.count+' אנשים');
      });
      // Show who hasn't responded
      var respondedUsers={};
      dates.forEach(function(d){
        (avail[d]||[]).forEach(function(en){ respondedUsers[en.userId]=true; });
      });
      var notResponded=[];
      Object.keys(users).forEach(function(uid){
        if(!respondedUsers[uid]) notResponded.push(users[uid].name);
      });
      if(notResponded.length>0) lines.push('עדיין לא הזינו זמינות: '+notResponded.join(', '));
    }

    if(window.state.dateFrom||window.state.dateTo) lines.push('טווח האירוע: '+(window.state.dateFrom||'פתוח')+' עד '+(window.state.dateTo||'פתוח'));
    if(window.state.isAdmin) lines.push('תפקיד המשתמש: מארגן אירוע (יכול למחוק אירוע ולקבוע תאריכים)');
    else lines.push('תפקיד המשתמש: משתתף');
    if (window.state.user) {
      lines.push('שם המשתמש הנוכחי: '+window.state.user.name);
    } else {
      lines.push('המשתמש אינו מחובר.');
    }
    lines.push('התאריך של היום: '+window.fmtKey(new Date()));
    return lines.join('\n');
  }

  function addMsg(text,role){
    var div=document.createElement('div');
    div.className='ai-msg '+(role==='user'?'user':'bot');
    div.textContent=text;
    msgs.appendChild(div);
    msgs.scrollTop=msgs.scrollHeight;
    return div;
  }

  // Function to handle AI commands
  async function handleAICommand(command) {
    console.log('AI Command received:', command);
    var action=command.action;
    var params=command.params||{};
    var message=command.message||'';
    var T=window.t||function(k,p){return k};

    switch (action) {
      case 'createEvent':
        if (params.eventName && params.userName) {
          document.getElementById('newEventName').value = params.eventName;
          document.getElementById('newOrgName').value = params.userName;
          if (params.dateFrom) document.getElementById('newDateFrom').value = params.dateFrom;
          if (params.dateTo) document.getElementById('newDateTo').value = params.dateTo;
          window.showScreen('screen-new');
          window.createEvent();
          if(message) addMsg(message, 'bot');
        } else {
          addMsg(message||T('ai.reply.createMissing'), 'bot');
        }
        break;
      case 'joinEvent':
        if (params.eventName && params.eventCode && params.userName) {
          document.getElementById('joinEventName').value = params.eventName;
          document.getElementById('joinCode').value = params.eventCode;
          document.getElementById('joinUserName').value = params.userName;
          window.showScreen('screen-join');
          window.joinEvent();
          if(message) addMsg(message, 'bot');
        } else {
          addMsg(message||T('ai.reply.joinMissing'), 'bot');
        }
        break;
      case 'addAvailability':
        if (params.date) {
          var dateObj = new Date(params.date+'T12:00:00');
          if (!isNaN(dateObj.getTime())) {
            window.state.selected = dateObj;
            window.state.month = dateObj.getMonth();
            window.state.year = dateObj.getFullYear();
            document.getElementById('noteInput').value = params.note||'';
            if(window.state.eventKey) {
              window.showScreen('screen-calendar');
              window.renderCal();
              window.renderSel();
              window.addAvailability();
              if(message) addMsg(message, 'bot');
            } else {
              addMsg(T('ai.reply.notInEvent'), 'bot');
            }
          } else {
            addMsg(T('ai.reply.badDate'), 'bot');
          }
        } else {
          addMsg(message||T('ai.reply.availMissing'), 'bot');
        }
        break;
      case 'deleteAvailability':
        if (params.date && window.state.eventKey) {
          var key = params.date;
          window.dbGet('events/'+window.state.eventKey+'/availability/'+key).then(function(snap){
            if(!snap.exists()){addMsg(T('ai.reply.noAvailForDate',{date:key}),'bot');return}
            var entries=snap.val();
            var filtered=entries.filter(function(en){return en.userId!==window.state.user.id});
            if(filtered.length===entries.length){addMsg(T('ai.reply.noAvailForDate',{date:key}),'bot');return}
            var p = filtered.length===0 ? window.dbRemove('events/'+window.state.eventKey+'/availability/'+key) : window.dbSet('events/'+window.state.eventKey+'/availability/'+key,filtered);
            p.then(function(){
              if(message) addMsg(message,'bot');
              else addMsg(T('ai.reply.availDeleted',{date:key}),'bot');
              // Update calendar view
              var dateObj=new Date(key+'T12:00:00');
              window.state.selected=dateObj;window.state.month=dateObj.getMonth();window.state.year=dateObj.getFullYear();
              window.renderCal();window.renderSel();
            });
          }).catch(function(e){addMsg(T('toast.saveAvailError',{msg:e.message}),'bot')});
        } else if(!window.state.eventKey){
          addMsg(T('ai.reply.notInEvent'), 'bot');
        } else {
          addMsg(message||T('ai.reply.delMissing'), 'bot');
        }
        break;
      case 'setEventDates':
        if (!window.state.isAdmin) {
          addMsg(T('ai.reply.adminOnly'), 'bot');
        } else if (!window.state.eventKey) {
          addMsg(T('ai.reply.notInEvent'), 'bot');
        } else {
          var updates = {};
          if(params.dateFrom) updates['events/'+window.state.eventKey+'/dateFrom'] = params.dateFrom;
          if(params.dateTo) updates['events/'+window.state.eventKey+'/dateTo'] = params.dateTo;
          if(Object.keys(updates).length>0){
            window._db.ref().update(updates).then(function() {
              if(message) addMsg(message, 'bot');
              else addMsg(T('ai.reply.datesUpdated'), 'bot');
              window.showToast(T('toast.datesUpdated'),'success');
            }).catch(function(e) {
              addMsg(T('toast.datesUpdateError',{msg:e.message}), 'bot');
            });
          } else {
            addMsg(message||T('ai.reply.datesMissing'),'bot');
          }
        }
        break;
      case 'deleteEvent':
        if (!window.state.isAdmin) {
          addMsg(T('ai.reply.deleteOnly'), 'bot');
        } else if (!window.state.eventKey) {
          addMsg(T('ai.reply.notInEvent'), 'bot');
        } else {
          window.dbRemove('events/'+window.state.eventKey).then(function() {
            addMsg(message||T('ai.reply.eventDeleted'), 'bot');
            window.showToast(T('toast.eventDeleted'),'success');
            setTimeout(function() { window.logout(); }, 1500);
          }).catch(function(e) {
            addMsg(T('toast.deleteError',{msg:e.message}), 'bot');
          });
        }
        break;
      case 'navigate':
        if (params.screen) {
          window.showScreen(params.screen);
          if(message) addMsg(message, 'bot');
        }
        break;
      case 'logout':
        window.logout();
        addMsg(message||T('ai.reply.loggedOut'), 'bot');
        break;
      case 'findBestDay':
        if(!window.state.eventKey){addMsg(T('ai.reply.notInEvent'),'bot');break}
        var avail=window.state.availability||{};
        var dayCounts=[];
        Object.keys(avail).forEach(function(d){
          dayCounts.push({date:d,count:(avail[d]||[]).length});
        });
        if(dayCounts.length===0){addMsg(message||T('ai.reply.noAvailEntered'),'bot');break}
        dayCounts.sort(function(a,b){return b.count-a.count});
        var best=dayCounts[0];
        var names=(avail[best.date]||[]).map(function(en){
          var u=window.state.users[en.userId];return u?u.name:'?';
        });
        addMsg(message||T('ai.reply.bestDay',{date:best.date, count:best.count, names:names.join(', ')}),'bot');
        // Navigate to that day
        var dateObj=new Date(best.date+'T12:00:00');
        window.state.selected=dateObj;window.state.month=dateObj.getMonth();window.state.year=dateObj.getFullYear();
        window.showScreen('screen-calendar');window.renderCal();window.renderSel();
        break;
      default:
        addMsg(message||T('ai.reply.unknown'), 'bot');
    }
  }

  async function sendMsg(){
    var text=input.value.trim();
    if(!text) return;
    input.value='';
    sendBtn.disabled=true;
    addMsg(text,'user');
    chatHistory.push({role:'user',parts:[{text:text}]});

    var T=window.t||function(k,p){return k};
    var typing=addMsg(T('ai.typing'),'bot');
    typing.classList.add('typing');

    var systemCtx='אתה עוזר AI ידידותי וחכם לאפליקציית תיאום זמינות קבוצתית בשם Quick Event Coordinator. ענה בשפה שבה המשתמש פונה אליך.\n\n';
    systemCtx+='כאשר המשתמש מבקש ממך לבצע פעולה, החזר JSON בלבד (ללא טקסט נוסף, ללא markdown) בפורמט:\n';
    systemCtx+='{\"action\":\"ACTION\",\"params\":{...},\"message\":\"הודעה ידידותית למשתמש\"}\n\n';
    systemCtx+='פעולות זמינות:\n';
    systemCtx+='- createEvent: params: eventName, userName, dateFrom?(YYYY-MM-DD), dateTo?(YYYY-MM-DD)\n';
    systemCtx+='- joinEvent: params: eventName, eventCode, userName\n';
    systemCtx+='- addAvailability: params: date(YYYY-MM-DD), note?(טקסט חופשי)\n';
    systemCtx+='- deleteAvailability: params: date(YYYY-MM-DD)\n';
    systemCtx+='- setEventDates: params: dateFrom?(YYYY-MM-DD), dateTo?(YYYY-MM-DD) [רק למארגן]\n';
    systemCtx+='- deleteEvent: [רק למארגן]\n';
    systemCtx+='- navigate: params: screen (screen-home/screen-new/screen-join/screen-calendar/screen-dashboard)\n';
    systemCtx+='- logout: התנתקות מהאירוע\n';
    systemCtx+='- findBestDay: מצא את היום שהכי הרבה אנשים פנויים בו\n\n';
    systemCtx+='חשוב: אם המשתמש שואל שאלה רגילה (לא מבקש פעולה), ענה בטקסט רגיל בלבד, לא JSON.\n';
    systemCtx+='חשוב: כשמחזיר JSON, החזר JSON טהור בלבד ללא ```json או תוספות.\n\n';
    systemCtx+='נתוני האירוע הנוכחי:\n'+buildContext();

    var recentHistory=chatHistory.slice(-10);

    var body={
      contents:[{role:'user',parts:[{text:systemCtx+'\n\n---\n'}]}].concat(recentHistory),
      generationConfig:{maxOutputTokens:500,temperature:0.7}
    };

    try{
      var res=await fetch(PROXY_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });
      if(!res.ok){
        var errText = T('toast.serverError') + ' (' + res.status + ')';
        typing.textContent=errText;
        typing.classList.remove('typing');
        chatHistory.pop();
        window.showToast(T('toast.botError'),'error');
        sendBtn.disabled=false;input.focus();return;
      }
      var data=await res.json();
      if(data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]){
        var reply=data.candidates[0].content.parts[0].text;
        typing.classList.remove('typing');

        // Try to extract JSON from the reply (handle ```json blocks too)
        var jsonStr=reply.trim();
        var jsonMatch=reply.match(/```(?:json)?\s*([\s\S]*?)```/);
        if(jsonMatch) jsonStr=jsonMatch[1].trim();

        try {
          var command = JSON.parse(jsonStr);
          if (command.action) {
            handleAICommand(command);
            typing.textContent = command.message || command.action;
            chatHistory.push({role:'model',parts:[{text:command.message||reply}]});
          } else {
            typing.textContent = reply;
            chatHistory.push({role:'model',parts:[{text:reply}]});
          }
        } catch (e) {
          // Not a JSON command, treat as regular text
          typing.textContent = reply;
          chatHistory.push({role:'model',parts:[{text:reply}]});
        }
      }else if(data.error){
        typing.textContent=T('toast.serverError') + ': '+(typeof data.error==='string'?data.error:JSON.stringify(data.error));
        typing.classList.remove('typing');
        chatHistory.pop();
      }else{
        typing.textContent=T('toast.serverError');
        typing.classList.remove('typing');
        chatHistory.pop();
      }
    }catch(e){
      typing.textContent=T('toast.serverError');
      typing.classList.remove('typing');
      chatHistory.pop();
      window.showToast(T('toast.serverError'),'error');
    }
    sendBtn.disabled=false;
    input.focus();
  }
})();
