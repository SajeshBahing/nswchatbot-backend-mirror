/* eslint-disable no-multi-str */
/* eslint-disable no-undef,no-redeclare */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
window.__forceSmoothScrollPolyfill__ = true;
const google_api_key = 'AIzaSyBEkt43qoPKj27EmpbFC68hrzfiJu7nAIo';
let converter = new showdown.Converter({ extensions: ['youtube'] });
converter.setOption('openLinksInNewWindow', true);
converter.setOption('youtubejsapi', true);

let welcome_message = true;

let parseWatsonText = (data) => {
    return converter.makeHtml(data.text);
    // console.log(data);
};

let genId = function (length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

let parseWatsonImage = (data) => {
    // ![Alt text](url/to/image =250x250 "Optional title")
    let img_url = data.source;
    let html = converter.makeHtml('![' + data.description + '](' + img_url + ' =250x* "' + data.title + '")');
    return html;
};

let parseWatsonOptions = (data) => {
    return converter.makeHtml(data.title);
};

youtubeAction = {};

onYouTubeIframeAPIReady = function() {
    youtubeAction = function (id, cb) {
        new YT.Player(id, {
            events : {
                'onStateChange': function(state) {
                    if (state.data === 0 || state.data === 2) {
                        if (cb)
                            cb();
                    }
                }
            }
        });
    }
};

let parseYoutubeVideo = (msg, cb) => {
    // ('![youtube video](Hear from a group of High School students talking about gambling.https://www.youtube.com/watch?v=pVt94kSI74M)')
    // ![Alt text](url/to/image =250x250 "Optional title")
    let vid_url = msg.value.input.text;
    let html_ = converter.makeHtml('![youtube video](' + vid_url + ')');

    let id = genId(6);
    html_ = html_.replace("<iframe", '<iframe id="' + id + '"');

    setTimeout(function() {
        youtubeAction(id, cb);
    }, 1500);

    return html_;
};

//https://www.youtube.com/embed/videoseries?list=PLlxOaF8FyB0qsZ6DB2k6KWIt4CV-dtXgF
let parseYoutubePlaylist = (msg, cb) => {
    let response = '';
    let id = genId(6);
    msg.options.forEach((element) => {
        response += '<iframe id="'+id+'" width="100%" src="' + element.value.input.text + '&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });

    setTimeout(function() {
        youtubeAction(id, cb);
    }, 1500);

    return response;
};

let parsePdf = (gen) => {
    var container = document.createElement('div');
    container.innerHTML = '<p>' + gen.label + '</p>';

    var link = document.createElement('a');
    link.setAttribute('href', gen.value.input.text);
    link.setAttribute('target', '_blank');
    link.classList.add('pdf-viewer-container');
    var canvas = document.createElement('canvas');
    canvas.classList.add('pdf-viewer');

    var loadingTask = pdfjsLib.getDocument(gen.value.input.text);
    loadingTask.promise.then(function (pdf) {
        return pdf.getPage(1);
    }).then((page) => {
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });

        var context = canvas.getContext('2d');
        canvas.height = (viewport.height) / 3;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);
    });

    link.appendChild(canvas);
    container.appendChild(link);

    return container;
};

function websitePreview(data) {
    return '<div class="previewWrapper"><iframe class="previewWindow" src="' + data.value.input.text + '"></iframe></div>';
}

let Botkit = {
    config: {
        //ws_url: (location.protocol === 'https' ? 'wss' : 'ws') + '://115.146.84.74:8051',
        ws_url: (location.protocol === 'https' ? 'wss' : 'ws') + '://10.140.68.64:3000',
        reconnect_timeout: 5000,
        max_reconnect: 5,
        enable_history: false
    },
    options: {
        use_sockets: true
    },
    reconnect_count: 0,
    guid: null,
    current_user: null,
    learn_more: true,
    scroll_skip_previous : false, 
    learnMoreCallback: function () {
        var that = Botkit;
        if (that.learn_more) {
            that.deliverMessage({
                type: 'learn_more',
                welcome_message: false,
                learn_more: that.learn_more,
                user: that.guid,
                session: that.session === '' ? false : that.session,
                channel: 'socket',
                user_profile: that.current_user ? that.current_user : null,
                location: that.location
            });

            that.learn_more = false;
        }
    },
    setLocation: function (location) {
        this.location = location;
    },
    getLocation: function () {
        return this.location;
    },
    on: function (event, handler) {
        this.message_window.addEventListener(event, function (evt) {
            handler(evt.detail);
        });
    },
    trigger: function (event, details) {
        var event = new CustomEvent(event, {
            detail: details
        });
        this.message_window.dispatchEvent(event);
    },
    request: function (url, body) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if (xmlhttp.status === 200) {
                        var response = xmlhttp.responseText;
                        if (response !== '') {
                            var message = null;
                            try {
                                message = JSON.parse(response);
                            } catch (err) {
                                reject(err);
                                return;
                            }
                            resolve(message);
                        } else {
                            resolve([]);
                        }
                    } else {
                        reject(new Error('status_' + xmlhttp.status));
                    }
                }
            };

            xmlhttp.open('POST', url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');
            xmlhttp.send(JSON.stringify(body));
        });
    },
    send: function(text, e, type, extra) {
        var that = this;
        if (e) e.preventDefault();
        if (!text) {
            return;
        }
        var message = {
            type: 'outgoing',
            text: text
        };

        this.clearReplies();
        that.renderMessage(message);

        let message_data = {
            type: typeof type === 'undefined' ? 'message' : type,
            text: text,
            location: that.location,
            user: this.guid,
            channel: this.options.use_sockets ? 'websocket' : 'webhook'
        };

        if (typeof extra !== 'undefined') {
            message_data = Object.assign(message_data, extra);
        }

        that.deliverMessage(message_data);

        this.input.value = '';

        this.trigger('sent', message);

        return false;
    },
    deliverMessage: function (message) {
        //console.log('DELIVER_MSG', message);
        if (this.options.use_sockets) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.webhook(message);
        }
    },
    getHistory: function (guid) {
        var that = this;
        if (that.guid) {
            that.request('/botkit/history', {
                user: that.guid
            }).then(function (history) {
                if (history.success) {
                    that.trigger('history_loaded', history.history);
                } else {
                    that.trigger('history_error', new Error(history.error));
                }
            }).catch(function (err) {
                that.trigger('history_error', err);
            });
        }
    },
    webhook: function (message) {
        var that = this;

        that.request('/api/messages', message).then(function (messages) {
            messages.forEach((message) => {
                that.trigger(message.type, message);
            });
        }).catch(function (err) {
            that.trigger('webhook_error', err);
        });
    },
    connect: function (user) {
        var that = this;

        if (user && user.id) {
            Botkit.setCookie('botkit_guid', user.id, 1);

            user.timezone_offset = new Date().getTimezoneOffset();
            that.current_user = user;
            //            console.log('CONNECT WITH USER', user);
        }
        // connect to the chat server!
        if (that.options.use_sockets) {
            that.connectWebsocket(that.config.ws_url);
        } else {
            that.connectWebhook();
        }
    },
    connectWebhook: function () {
        var that = this;
        var connectEvent = 'hello';
        if (Botkit.getCookie('botkit_guid')) {
            that.guid = Botkit.getCookie('botkit_guid');
            connectEvent = 'welcome';
        } else {
            that.guid = that.generate_guid();
            Botkit.setCookie('botkit_guid', that.guid, 1);
        }

        if (this.options.enable_history) {
            that.getHistory();
        }

        // connect immediately
        that.trigger('connected', {});
        that.webhook({
            type: connectEvent,
            user: that.guid,
            channel: 'webhook'
        });
    },
    disconnectWebsocket: function () {
        this.socket.close();
    },
    connectWebsocket: function (ws_url) {
        var that = this;
        // Create WebSocket connection.
        that.socket = new WebSocket(ws_url);

        let connectEvent;
        if (Botkit.getCookie('botkit_guid')) {
            that.guid = Botkit.getCookie('botkit_guid');
            connectEvent = 'welcome';
        } else {
            that.guid = that.generate_guid();
            Botkit.setCookie('botkit_guid', that.guid, 1);
        }

        that.session = Botkit.getCookie('bootkit_session_id');

        if (this.options.enable_history) {
            that.getHistory(); 
        }

        // Connection opened
        that.socket.addEventListener('open', function (event) {
            that.reconnect_count = 0;
            that.trigger('connected', event);

            that.deliverMessage({
                type: connectEvent,
                welcome_message: welcome_message,
                user: that.guid,
                session: that.session === '' ? false : that.session,
                channel: 'socket',
                user_profile: that.current_user ? that.current_user : null,
                location: that.location
            });

            welcome_message = false;
        });

        that.socket.addEventListener('error', function (event) {
            console.error('ERROR', event);
        });

        that.socket.addEventListener('close', function (event) {
            console.log('SOCKET CLOSED!');
            that.trigger('disconnected', event);
            if (that.reconnect_count < that.config.max_reconnect) {
                setTimeout(function () {
                    console.log('RECONNECTING ATTEMPT ', ++that.reconnect_count);
                    that.connectWebsocket(that.config.ws_url);
                }, that.config.reconnect_timeout);
                that.message_window.classList.add('offline');
            } else {
                that.message_window.classList.add('offline');
            }
        });

        // Listen for messages
        that.socket.addEventListener('message', function (event) {
            var message = null;
            try {
                message = JSON.parse(event.data);
            } catch (err) {
                that.trigger('socket_error', err);
                return;
            }

            that.trigger(message.type, message);
        });
    },
    clearReplies: function() {
        //this.replies.innerHTML = '';
    },
    quickReply: function(payload) {
        this.send(payload);
    },
    focus: function() {
        this.input.focus();
    },
    watsonMessages: function(contents) {
        var labels = [];
        for (let i = 0; i < contents.options.length; i++) {
            let op = contents.options[i];

            switch (contents.response_type) {
            case 'counselor_map':
                let map = 'http://maps.google.co.in/maps?q=' + op.value.split(' ').join('+');
                labels.push(
                    `<span class="tag-location">\
                    ${ op.label } (${ op.service_area.join(', ') })<br />\
                    <a href="${ map }" target="_blank" onclick="">${ op.value }</a></br />\
                    Phone: <a href="tel:${ op.phone }">${ op.phone }</a></br>\
                    <a href="#" title="Book appointment" onclick="Botkit.send('Book an appointment with ${ op.label }', false, 'message', {'counselor': '${ op.id }'}); return false;" class="appointment_button">\
                        <i class="material-icons">chevron_right</i>\
                        <span>Book an appointment</span>\
                    </a>\
                    </span>`
                );
                break;

            case 'social_media':
                if (op.value.input.text === '') {
                    break;
                }

                let icon = '';
                switch (op.label) {
                case 'facebook':
                    icon = '<i style="color: #4267B2;" class="socicon-facebook"></i>';
                    break;
                case 'twitter':
                    icon = '<i style="color: #4DA7DE;" class="socicon-twitter"></i>';
                    break;
                case 'reddit':
                    icon = '<i style="color: #E74A1E;" class="socicon-reddit"></i>';
                    break;
                case 'tumblr':
                    icon = '<i style="color: #45556C;" class="socicon-tumblr"></i>';
                    break;
                case 'youtube':
                    icon = '<i style="color: #E02A20;" class="socicon-youtube"></i>';
                    break;
                case 'vimeo':
                    icon = '<i style="color: #51B5E7;" class="socicon-vimeo"></i>';
                    break;
                default:
                    icon = 'asd';
                    break;
                }

                labels.push(`<a class="social_icons" target="_blank" href="${ op.value.input.text }"><span>${ icon }</span></a>`);
                break;

            case 'link':
                labels.push(`<span><a target="_blank" href="${op.value.input.text}">${op.label}</a></span>`);
                break;

            case 'redo_calculation':
                labels.push(`<span><a href="#" onclick="Botkit.send('${op.label}', false, 'redo_calculation'); return false;">${op.label}</a></span>`);
                break;
            case 'redo_quiz':
                labels.push(`<span><a href="#" onclick="Botkit.send('${op.label}', false, 'redo_quiz'); return false;">${op.label}</a></span>`);
                break;
                redo_quiz

            default:
                if (op.label === op.value.input.text) {
                    labels.push(`<span><a href="#" onclick="Botkit.send(this.textContent); return false;">${ op.label }</a></span>`);
                } else {
                    labels.push(`<span><a href="${ op.value.input.text }" target="_blank">${ op.label }</a></span>`);
                }
                break;
            }
        }

        return labels.join('');
        // document.querySelector('#message_replies').innerHTML = labels.join('');
    },
    filterLinks: function (text) {
        if (text.indexOf('[link href="') >= 0) {
            var link = text.substring(text.indexOf('href="') + 6, text.indexOf('"]') - 1)
            var text_ = text.substring(text.indexOf('"]')+ 2, text.indexOf('[link]') );

            text_ = '<a target="_blank" href="'+ link +'">' + text_ + '</a>';

            var original_text = text.substring(text.indexOf('[link'), text.indexOf('[link]') + 6);
            
            text = text.replace(original_text, text_);
        } else {
            var regLink = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);

            var links = text.match(regLink);
            if (links !== null) {
                for (var i = 0; i <= links.length; i++) {
                    if (typeof links[i] !== 'undefined') {
                        text = text.replace(links[i], '<a href="' + links[i] + '" target="_blank">' + links[i] + '</a>');
                    }
                }
            }
        }

        var phoneNumber = new RegExp(/(\(+61\)|\+61|\(0[1-9]\)|0[1-9])?( ?-?[0-9]){6,10}/g);
        var phoneNumbers = text.match(phoneNumber);

        if (phoneNumbers !== null) {
            for (var i = 0; i <= phoneNumbers.length; i++) {
                if (typeof phoneNumbers[i] !== 'undefined') {
                    var tempNumber = phoneNumbers[i].trim().replace(' ', '');

                    text = text.replace(phoneNumbers[i], '<a href="tel:' + tempNumber + '" target="_blank">' + phoneNumbers[i] + '</a>');
                }
            }
        }

        return text;
    },
    multiChoiceTags: function () {
        var options = document.querySelector('#message_list>div:last-child .message .multi_option');
        var data = [];
        var input = document.querySelector('#messenger_input');

        if (options !== null) {
            options.querySelectorAll('a').forEach(function (e) {

                e.removeAttribute('onclick');

                e.addEventListener('click', (el) => {
                    var text = e.innerText;

                    if (data.includes(text)) {
                        data.splice(data.indexOf(text), 1);
                        e.parentElement.classList.remove('selected');
                    } else {
                        data.push(text);
                        e.parentElement.classList.add('selected');
                    }

                    input.value = data.join(', ').trim();
                });
            });
        }
    },
    renderMessage: function(message) {
        let that = this;

        if (typeof message.sender_action !== 'undefined' && message.sender_action === 'typing_on') {
            // that.next_line.innerHTML = 'Typing...';
            // add code to show typing status message
            
            return;
        }

        if (message.text) {
            if (message.type === 'outgoing') {
                message.avatar = that.images.user;
                message.html = converter.makeHtml(message.text);
                if (!that.next_line) {
                    that.next_line = document.createElement('div');
                    that.message_list.appendChild(that.next_line);
                }
                that.next_line.innerHTML = that.message_template({
                    message: message
                });
            } else
            // Print the 1st response from Watson
            // eslint-disable-next-line brace-style
            {
                message.avatar = that.images.bot;

                that.learn_more = true;
                if (message.generic) {
                    if (message.generic.length > 0) {

                        let length = 0;
                        let LengthyVideoMessage = false;

                        message.generic.forEach(gen => {
                            let useTemplate = true;
                            switch (gen.response_type) {
                            case 'text':
                                message.html = parseWatsonText(gen);

                                message.html = this.filterLinks(message.html);
                                break;
                            case 'image':
                                message.html = parseWatsonImage(gen);
                                break;
                            case 'option':
                                message.tags = this.watsonMessages(gen);
                                message.html = parseWatsonOptions(gen);

                                that.learn_more = false;
                                break;
                            case 'social_media':
                                message.tags = this.watsonMessages(gen);
                                message.html = '<p>' + gen.description + '</p>';
                                break;
                            case 'pause':
                                break;
                            //    CUSTOM RESPONSE TYPES
                            case 'video':
                                message.type = 'youtube';
                                message.html = '';
                                gen.options.forEach((element) => {
                                    message.html += '<p>' + element.label + '</p>';
                                    message.html += parseYoutubeVideo(element, that.learnMoreCallback);
                                });
                                LengthyVideoMessage = true;
                                break;
                            case 'video_playlist':
                                message.type = 'youtube';
                                message.html = gen.title;

                                message.html += parseYoutubePlaylist(gen, that.learnMoreCallback);
                                LengthyVideoMessage = true;
                                break;
                            case 'pdf':
                                message.type = 'pdf';
                                useTemplate = false;
                                message.html = [];
                                gen.options.forEach((element) => {
                                    message.html.push(parsePdf(element));
                                });
                                break;
                            case 'link':
                                message.type = 'link';
                                message.html = '<p>' + gen.description + '</p>';
                                message.tags = this.watsonMessages(gen);
                                break;
                            case 'counselor_map':
                                message.type = 'counselor_map';
                                message.tags = this.watsonMessages(gen);
                                message.html = this.filterLinks(parseWatsonOptions(gen));
                                break;

                            case 'redo_calculation':
                                message.html = '';
                                message.tags = this.watsonMessages(gen);
                                break;

                            case 'redo_quiz':
                                message.html = '';
                                message.tags = this.watsonMessages(gen);
                                break;
                            default:
                            }

                            that.next_line = document.createElement('div');
                            that.message_list.appendChild(that.next_line);
                            
                            if (length == 0) {
                                if (!that.scroll_skip_previous) {
                                    let prevSibling = that.next_line.previousSibling;
                                    if (prevSibling) {
                                        length += prevSibling.scrollHeight;
                                    }
                                }
                            }

                            if (useTemplate) {
                                that.next_line.innerHTML = that.message_template({
                                    message: message
                                });
                            } else {
                                message.html.forEach((element) => {
                                    that.next_line.appendChild(element);
                                });
                            }

                            length += that.next_line.scrollHeight + 15;
                        });
                        //scroll at top of new message
                        var main_message_container = document.querySelector('#message_main_container');
                        main_message_container.scrollTo(0, main_message_container.scrollHeight - (length + 15));

                        that.scroll_skip_previous = LengthyVideoMessage;
                    }
                } else {
                    that.next_line = document.createElement('div');
                    that.message_list.appendChild(that.next_line);
                    message.html = '<p>' + message.text + '</p>';

                    that.next_line.innerHTML = that.message_template({
                        message: message
                    });
                    that.focus();

                    var main_message_container = document.querySelector('#message_main_container');
                    main_message_container.scrollTo(0, main_message_container.scrollHeight);
                }

                document.querySelectorAll('#message_list > div:not(:last-child)').forEach((element) => {
                    element.querySelectorAll('.chat-tags a').forEach((elem) => {
                        elem.parentElement.style.opacity = '0.7';
                        elem.parentElement.style.cursor = 'not-allowed';
                        elem.style.cursor='not-allowed';
                        elem.removeAttribute('onclick');
                    });
                });
            }
        }

        // add logic here for multi choice options
        this.multiChoiceTags();

        if (!message.isTyping) {
            delete (that.next_line);
        }
    },
    triggerScript: function (script, thread) {
        this.deliverMessage({
            type: 'trigger',
            user: this.guid,
            channel: this.options.use_sockets ? 'websocket' : 'webhook',
            script: script,
            thread: thread,
            location: this.location
        });
    },
    identifyUser: function (user) {
        user.timezone_offset = new Date().getTimezoneOffset();

        this.guid = user.id;
        Botkit.setCookie('botkit_guid', user.id, 1);

        this.current_user = user;

        this.deliverMessage({
            type: 'identify',
            user: this.guid,
            location: this.location,
            channel: this.options.use_sockets ? 'websocket' : 'webhook',
            user_profile: user
        });
    },
    receiveCommand: function (event) {
        switch (event.data.name) {
        case 'trigger':
            // tell Botkit to trigger a specific script/thread
            console.log('TRIGGER', event.data.script, event.data.thread);
            Botkit.triggerScript(event.data.script, event.data.thread);
            break;
        case 'identify':
            // link this account info to this user
            console.log('IDENTIFY', event.data.user);
            Botkit.identifyUser(event.data.user);
            break;
        case 'connect':
            // link this account info to this user
            Botkit.connect(event.data.user);
            break;
        default:
            //console.log('UNKNOWN COMMAND', event.data);
        }
    },
    sendEvent: function (event) {
        if (this.parent_window) {
            this.parent_window.postMessage(event, '*');
        }
    },
    deleteCookie: function (name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    },
    setCookie: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    },
    getCookie: function (cname) {
        var name = cname + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    },
    generate_guid: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },
    boot: function (user) {
        console.log('Booting up');

        var that = this;
        that.deleteCookie('bootkit_session_id');

        that.images = {
            'bot': 'avatar.svg',
            'user': 'avatar_.svg'
        };

        document.querySelector('#bot_avatar').setAttribute('src', 'resources/images/' + that.images.bot);

        that.message_window = document.getElementById('message_window');

        that.message_list = document.getElementById('message_list');

        Handlebars.registerHelper('if_equal', function(a, b, opts) {
            if (a != b) {
                return opts.fn(this)
            } else {
                return opts.inverse(this)
            }
        });

        var source = '<div class="message {{message.type}}">\
                        {{#if message.isTyping}}\
                            <div class="typing-indicator">\
                                <span></span>\
                                <span></span>\
                                <span></span>\
                            </div>\
                        {{/if}}\
                        {{#if_equal message.html ""}}\
                        <div class="avatar">\
                            <img src="resources/images/{{{message.avatar}}}" alt="Avatar"/>\
                        </div>\
                        <div class="message-content">\
                            {{{message.html}}}\
                        </div>\
                        {{/if_equal}}\
                        <div class="chat-tags {{{message.message_option_type}}}" id="message_replies">{{{message.tags}}}</div>\
                        <div class="images_selector">{{{message.image_selection}}}</div>\
                    </div>';

        that.message_template = Handlebars.compile(source);

        that.replies = document.getElementById('message_replies');

        that.input = document.getElementById('messenger_input');

        that.on('connected', function () {
            that.message_window.className = 'chat-container connected';
            that.input.disabled = false;
            that.sendEvent({
                name: 'connected'
            });
        });

        that.on('disconnected', function () {
            that.message_window.className = 'chat-container disconnected';
            that.input.disabled = true;
        });

        that.on('webhook_error', function (err) {
            alert('Error sending message!');
            console.error('Webhook Error', err);
        });

        that.on('typing', function () {
            that.clearReplies();
            that.renderMessage({
                isTyping: true
            });
        });

        that.on('sent', function () {
            // do something after sending
        });

        that.on('session', function (message) {
            Botkit.setCookie('bootkit_session_id', message.session_id, 1);
        });

        that.on('message', function (message) {
            if (typeof message.session_id === 'undefined') {
                that.renderMessage(message);
            } else {
                Botkit.setCookie('bootkit_session_id', message.session_id, 1);
            }
        });

        that.on('message', function (message) {
            if (message.goto_link) {
                window.location = message.goto_link;
            }
        });

        that.on('message', function (message) {
            if (document.querySelector("#empty-chat")) {
                document.querySelector("#empty-chat").remove();
            }
            that.clearReplies();
            if (message.quick_replies) {
                var list = document.createElement('ul');

                var elements = [];
                for (var r = 0; r < message.quick_replies.length; r++) {
                    (function (reply) {
                        var li = document.createElement('li');
                        var el = document.createElement('a');
                        el.innerHTML = reply.title;
                        el.href = '#';

                        el.onclick = function () {
                            that.quickReply(reply.payload);
                        };

                        li.appendChild(el);
                        list.appendChild(li);
                        elements.push(li);
                    })(message.quick_replies[r]);
                }

                that.replies.appendChild(list);

                // uncomment this code if you want your quick replies to scroll horizontally instead of stacking
                // var width = 0;
                // // resize this element so it will scroll horizontally
                // for (var e = 0; e < elements.length; e++) {
                //     width = width + elements[e].offsetWidth + 18;
                // }
                // list.style.width = width + 'px';

                if (message.disable_input) {
                    that.input.disabled = true;
                } else {
                    that.input.disabled = false;
                }
            } else {
                that.input.disabled = false;
            }
        });

        that.on('history_loaded', function (history) {
            if (history) {
                for (var m = 0; m < history.length; m++) {
                    that.renderMessage({
                        text: history[m].text,
                        type: history[m].type === 'message_received' ? 'outgoing' : 'incoming' // set appropriate CSS class
                    });
                }
            }
        });

        if (window.self !== window.top) {
            // this is embedded in an iframe.
            // send a message to the master frame to tell it that the chat client is ready
            // do NOT automatically connect... rather wait for the connect command.
            that.parent_window = window.parent;
            window.addEventListener('message', that.receiveCommand, false);
            that.sendEvent({
                type: 'event',
                name: 'booted'
            });
            console.log('Messenger booted in embedded mode');
        } else {
            console.log('Messenger booted in stand-alone mode');
            // this is a stand-alone client. connect immediately.
            that.connect(user);
        }

        that.focus();

        return that;
    }
};

function diss() {
    Botkit.disconnectWebsocket();
}

function geocode(text, cb) {
    let requestUrl = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + google_api_key + '&address=';

    text = text.replace(/\s/g, '+');

    let http = new XMLHttpRequest();
    http.open('GET', requestUrl + text);
    http.send();

    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(http.responseText);

            if (response.status === 'OK') {
                cb(response);
            }
        }
    };
}

(function () {
    // your page initialization code here
    // the DOM will be available here

    navigator.geolocation.watchPosition(
        function (position) {
            Botkit.setLocation(
                {
                    'latitude': position.coords.latitude,
                    'longitude': position.coords.longitude
                }
            );
        },
        () => {
            console.log('Location not available!');
        }
    );

    Botkit.boot();
})();
