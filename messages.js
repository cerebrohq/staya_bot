// время - изменить время ежедневной рассылки;\n\n\
var messages = {   
    beginText: "Здравствуйте! Staya Bot - дружелюбный Бот, \
    который найдет для вас самые интересные вакансии в системе Staya. \
    Вам осталось только указать интересные для вас профессиональные области!", // площадку вакансий и и время, когда посылать подборку вакансий
    helloText: "Хотите изменить рассылку?",    
    helpMessage: "Я понимаю команды: \n\n\
    работа - сменить интересные разделы вакансий;\n\n\
    площадка - сменить площадку, с которой вы хотите получать вакансии;\n\n\
    старт - возобновить рассылку;\n\n\
    стоп - прекратить рассылку;\n\n\
    миша - все по новой;\n\n\
    потом - выйти из диалога;\n\n\
    stayabot не слушай - запретить реагировать на любые сообщения. При этом вакансии будут приходить. Эта команда может понадобиться при добавлении бота в группу;\n\n\
    stayabot слушай - разрешить реагировать на команды.", // ресурс - сменить площадку вакансий;\n\n\
    timeMessage: "Задайте время, во сколько вы хотите получать ежедневную рассылку, например 18:30",
    goоdMessage: "Отлично, будем на связи, удачи ;)",   
    badMessage: "Что-то пошло не так, давайте по новой!",  
    select: "Укажите номера интересных разделов вакансий через пробел, например: 2 4",
    selectArea: "Укажите адрес площадки, с которой вы хотите получать новые вакансии, например: http://jobs.staya.vc\n\n",
    cancel: "Добро, займемся позже.",
    shutdownMessage: "Хорошо, умолкаю.",
    stopListen: "Хорошо, я больше не буду отвечать. Если хотите, чтобы я начал снова отвечать на ваши команды, напишите -\n\nstayabot слушай",
    startListen: "Отлично, я снова в деле!"
};

module.exports = messages;