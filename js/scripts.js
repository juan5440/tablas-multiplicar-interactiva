
        // Variables globales
        let currentTable = 1;
        let practiceCorrect = 0;
        let practiceWrong = 0;
        let practiceQuestions = [];
        let practiceIndex = 0;
        
        let quizScore = 0;
        let quizCombo = 0;
        let quizCorrect = 0;
        let quizWrong = 0;
        let quizQuestions = [];
        let quizIndex = 0;
        const QUIZ_TOTAL = 10;
        
        let challengeTimer = null;
        let challengeTime = 60;
        let challengeScore = 0;
        let challengeCombo = 0;
        let currentChallengeAnswer = 0;
        
        let playerHealth = 100;
        let monsterHealth = 100;
        let battleWins = 0;
        let currentBattleAnswer = 0;
        
        const monsters = [
            { name: 'Slime Numérico', emoji: '🟢', health: 50 },
            { name: 'Fantasma Calculador', emoji: '👻', health: 70 },
            { name: 'Robot Matemático', emoji: '🤖', health: 80 },
            { name: 'Dragón de Números', emoji: '🐉', health: 100 },
            { name: 'Alien Multiplicador', emoji: '👽', health: 90 },
            { name: 'Monstruo Morado', emoji: '👾', health: 85 },
            { name: 'Ogro Furioso', emoji: '👹', health: 120 }
        ];
        
        let currentMonster = null;
        
        // Síntesis de voz: permite usar voz seleccionada en UI o por nombre/lang
        function speak(text, options = {}) {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();

            const { lang = 'es-MX', voiceName = null, rate = 0.9, pitch = 1.1 } = options;

            const uiVoice = (typeof document !== 'undefined' && document.getElementById('voiceSelect')) ? document.getElementById('voiceSelect').value : null;
            const savedVoice = (typeof localStorage !== 'undefined') ? localStorage.getItem('selectedVoice') : null;
            const desiredVoiceName = voiceName || uiVoice || savedVoice || null;

            const speakNow = (voices) => {
                console.debug('Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));

                let selected = null;
                if (desiredVoiceName) {
                    selected = voices.find(v => v.name === desiredVoiceName);
                }
                if (!selected) {
                    selected = voices.find(v => v.lang === lang);
                }
                if (!selected) {
                    const prefix = lang.split('-')[0];
                    selected = voices.find(v => v.lang && v.lang.startsWith(prefix));
                }
                if (!selected) {
                    selected = voices.find(v => /latino|latam|latin|mex|mx|es-419/i.test(v.name + ' ' + v.lang));
                }

                const utterance = new SpeechSynthesisUtterance(text);
                if (selected) {
                    utterance.voice = selected;
                    utterance.lang = selected.lang || lang;
                } else {
                    utterance.lang = lang;
                }
                utterance.rate = rate;
                utterance.pitch = pitch;
                window.speechSynthesis.speak(utterance);
            };

            let voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) {
                const handler = () => {
                    voices = window.speechSynthesis.getVoices();
                    speakNow(voices);
                    window.speechSynthesis.onvoiceschanged = null;
                };
                window.speechSynthesis.onvoiceschanged = handler;
            } else {
                speakNow(voices);
            }
        }

        // Rellena el select de voces y sincroniza label/preview
        function populateVoiceList() {
            if (!('speechSynthesis' in window)) return;
            const select = document.getElementById('voiceSelect');
            if (!select) return;

            const voices = window.speechSynthesis.getVoices() || [];
            select.innerHTML = '<option value="">Predeterminada</option>';
            voices.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.name;
                opt.textContent = `${v.name} (${v.lang})`;
                select.appendChild(opt);
            });

            const saved = localStorage.getItem('selectedVoice');
            if (saved) select.value = saved;

            const currentLabel = document.getElementById('currentVoiceLabel');
            const previewBtn = document.getElementById('previewVoice');

            function updateLabel() {
                const name = select.value || 'Predeterminada';
                if (currentLabel) currentLabel.textContent = name;
                if (previewBtn) previewBtn.title = select.value ? `Ejemplo con ${name}` : 'Haz clic para escuchar ejemplo';
                localStorage.setItem('selectedVoice', select.value);
            }

            select.onchange = updateLabel;
            updateLabel();

            if (previewBtn) {
                previewBtn.onclick = () => {
                    const sample = 'Hola, ¿cómo estás? Esto es una prueba de voz.';
                    const voiceName = select.value || null;
                    speak(sample, { voiceName, lang: 'es-MX', rate: 0.9, pitch: 1.1 });
                };
            }
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
            document.addEventListener('DOMContentLoaded', populateVoiceList);
        }
        
        // --- Fondo personalizable (manejo) ---
        function setBackgroundImage(src) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            if (!src) {
                bg.style.backgroundImage = '';
                localStorage.removeItem('bgImage');
                return;
            }
            bg.style.backgroundImage = `url('${src}')`;
            localStorage.setItem('bgImage', src);
        }

        function handleBgFile(e) {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target.result;
                setBackgroundImage(dataUrl);
            };
            reader.readAsDataURL(f);
        }

        function applyBgUrl() {
            const input = document.getElementById('bgUrlInput');
            if (!input) return;
            const url = input.value.trim();
            if (!url) return alert('Pega la URL de la imagen');
            setBackgroundImage(url);
        }

        function clearBackground() {
            setBackgroundImage(null);
            const input = document.getElementById('bgUrlInput');
            if (input) input.value = '';
        }

        function loadSavedBackground() {
            const saved = localStorage.getItem('bgImage');
            if (saved) {
                const bg = document.getElementById('bgLayer');
                if (bg) bg.style.backgroundImage = `url('${saved}')`;
            }
        }

        // Opacidad / Blur
        const opacityRange = document.getElementById('bgOpacityRange');
        const opacityLabel = document.getElementById('bgOpacityLabel');
        const blurRange = document.getElementById('bgBlurRange');
        const blurLabel = document.getElementById('bgBlurLabel');

        function setBgOpacity(value) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            bg.style.opacity = String(value);
            localStorage.setItem('bgOpacity', String(value));
            if (opacityLabel) opacityLabel.textContent = `${Math.round(value * 100)}%`;
        }

        function setBgBlur(px) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            const blurCss = px > 0 ? `blur(${px}px)` : 'none';
            bg.style.filter = blurCss;
            localStorage.setItem('bgBlur', String(px));
            if (blurLabel) blurLabel.textContent = `${px}px`;
        }

        if (opacityRange) {
            opacityRange.addEventListener('input', (e) => setBgOpacity(parseFloat(e.target.value)));
        }
        if (blurRange) {
            blurRange.addEventListener('input', (e) => setBgBlur(parseInt(e.target.value, 10)));
        }

        // Posición / Tamaño
        const posSelect = document.getElementById('bgPositionSelect');
        const sizeSelect = document.getElementById('bgSizeSelect');

        function setBgPosition(pos) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            bg.style.backgroundPosition = pos;
            localStorage.setItem('bgPosition', pos);
        }

        function setBgSize(sz) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            bg.style.backgroundSize = sz === 'cover' ? 'cover' : 'contain';
            localStorage.setItem('bgSize', sz);
        }

        if (posSelect) {
            posSelect.addEventListener('change', (e) => setBgPosition(e.target.value));
        }
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => setBgSize(e.target.value));
        }

        // Conectar input de archivo
        const bgFileInput = document.getElementById('bgFileInput');
        if (bgFileInput) bgFileInput.addEventListener('change', handleBgFile);

        // Restaurar valores guardados
        (function restoreBgSettings() {
            loadSavedBackground();

            const savedOpacity = localStorage.getItem('bgOpacity');
            const savedBlur = localStorage.getItem('bgBlur');
            const savedPos = localStorage.getItem('bgPosition');
            const savedSize = localStorage.getItem('bgSize');

            if (savedOpacity !== null) {
                const v = parseFloat(savedOpacity);
                if (opacityRange) opacityRange.value = String(v);
                setBgOpacity(v);
            }
            if (savedBlur !== null) {
                const b = parseInt(savedBlur, 10);
                if (blurRange) blurRange.value = String(b);
                setBgBlur(b);
            }
            if (savedPos !== null) {
                if (posSelect) posSelect.value = savedPos;
                setBgPosition(savedPos);
            }
            if (savedSize !== null) {
                if (sizeSelect) sizeSelect.value = savedSize;
                setBgSize(savedSize);
            }
        })();

            // --- Música de Batalla ---
            const battleAudio = document.getElementById('battleMusic');

            function setBattleMusic(src) {
                if (!battleAudio) return;
                if (!src) {
                    battleAudio.src = '';
                    localStorage.removeItem('battleMusic');
                    return;
                }
                battleAudio.src = src;
                localStorage.setItem('battleMusic', src);
            }

            function handleBattleMusicFile(e) {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const dataUrl = ev.target.result;
                    setBattleMusic(dataUrl);
                };
                reader.readAsDataURL(f);
            }

            function applyBattleMusicUrl() {
                const input = document.getElementById('battleMusicUrlInput');
                if (!input) return;
                const url = input.value.trim();
                if (!url) return alert('Pega la URL del audio');
                setBattleMusic(url);
            }

            function clearBattleMusic() {
                setBattleMusic(null);
                const input = document.getElementById('battleMusicUrlInput');
                if (input) input.value = '';
            }

            function playBattleMusic() {
                try {
                    const src = localStorage.getItem('battleMusic');
                    if (src && battleAudio) {
                        if (battleAudio.src !== src) battleAudio.src = src;
                        battleAudio.volume = 0.35;
                        battleAudio.play().catch(() => {});
                    }
                } catch (e) { console.warn('No se pudo reproducir música de batalla', e); }
            }

            function stopBattleMusic() {
                try {
                    if (battleAudio) {
                        battleAudio.pause();
                        battleAudio.currentTime = 0;
                    }
                } catch (e) { /* noop */ }
            }

            // Conectar input de archivo para música
            const battleMusicFileInput = document.getElementById('battleMusicFileInput');
            if (battleMusicFileInput) battleMusicFileInput.addEventListener('change', handleBattleMusicFile);

            // Cargar música guardada si existe
            (function loadSavedBattleMusic() {
                const saved = localStorage.getItem('battleMusic');
                if (saved && battleAudio) {
                    battleAudio.src = saved;
                }
            })();
        
        // Navegación
        function showScreen(screen) {
            const screens = ['mainMenu', 'exploreScreen', 'practiceScreen', 'quizScreen', 'quizResultsScreen', 'challengeScreen', 'battleScreen'];
            // Al cambiar de pantalla, ocultar todas y detener música de batalla si no estamos en 'battle'
            screens.forEach(s => document.getElementById(s).classList.add('hidden'));
            if (screen !== 'battle') stopBattleMusic();
            
            switch(screen) {
                case 'main':
                    document.getElementById('mainMenu').classList.remove('hidden');
                    if (challengeTimer) clearInterval(challengeTimer);
                    break;
                case 'explore':
                    document.getElementById('exploreScreen').classList.remove('hidden');
                    generateTablesGrid();
                    break;
                case 'practice':
                    document.getElementById('practiceScreen').classList.remove('hidden');
                    break;
                case 'quiz':
                    document.getElementById('quizScreen').classList.remove('hidden');
                    startQuiz();
                    break;
                case 'quizResults':
                    document.getElementById('quizResultsScreen').classList.remove('hidden');
                    break;
                case 'challenge':
                    document.getElementById('challengeScreen').classList.remove('hidden');
                    startChallenge();
                    break;
                case 'battle':
                    document.getElementById('battleScreen').classList.remove('hidden');
                    startBattle();
                    playBattleMusic();
                    break;
            }
        }
        
        // Generar grid de tablas
        function generateTablesGrid() {
            const grid = document.getElementById('tablesGrid');
            grid.innerHTML = '';
            
            const colors = [
                'from-red-400 to-red-500',
                'from-orange-400 to-orange-500',
                'from-yellow-400 to-yellow-500',
                'from-green-400 to-green-500',
                'from-teal-400 to-teal-500',
                'from-blue-400 to-blue-500',
                'from-indigo-400 to-indigo-500',
                'from-purple-400 to-purple-500',
                'from-pink-400 to-pink-500',
                'from-rose-400 to-rose-500'
            ];
            
            const emojis = ['🌟', '🎈', '🎪', '🎨', '🎯', '🚀', '🌈', '🎵', '🦋', '🔥'];
            
            for (let i = 1; i <= 10; i++) {
                const card = document.createElement('div');
                card.className = `table-card bg-gradient-to-br ${colors[i-1]} p-3 sm:p-4 rounded-2xl shadow-xl text-center text-white cursor-pointer`;
                card.innerHTML = `
                    <div class="text-2xl sm:text-3xl mb-1">${emojis[i-1]}</div>
                    <div class="text-3xl sm:text-4xl title-font">${i}</div>
                    <p class="text-xs sm:text-sm opacity-90">Tabla del ${i}</p>
                `;
                card.onclick = () => openTableModal(i);
                grid.appendChild(card);
            }
        }
        
        // Modal de tabla
        function openTableModal(num) {
            currentTable = num;
            document.getElementById('modalTableTitle').textContent = `Tabla del ${num} 🎯`;
            
            const content = document.getElementById('modalTableContent');
            content.innerHTML = '';
            
            for (let i = 1; i <= 10; i++) {
                const row = document.createElement('div');
                row.className = 'flex items-center justify-center gap-3 text-lg md:text-xl animate-pop';
                row.style.animationDelay = `${i * 0.05}s`;
                row.innerHTML = `
                    <span class="title-font text-purple-600 w-8">${num}</span>
                    <span class="text-gray-400">×</span>
                    <span class="title-font text-blue-500 w-8">${i}</span>
                    <span class="text-gray-400">=</span>
                    <span class="title-font text-green-500 w-12">${num * i}</span>
                `;
                content.appendChild(row);
            }
            
            document.getElementById('tableModal').classList.remove('hidden');
            speak(`Tabla del ${num}`);
        }
        
        function closeTableModal() {
            document.getElementById('tableModal').classList.add('hidden');
        }
        
        function speakTable() {
            let text = `Tabla del ${currentTable}. `;
            for (let i = 1; i <= 10; i++) {
                text += `${currentTable} por ${i} igual a ${currentTable * i}. `;
            }
            speak(text);
        }
        
        // Práctica individual
        function practiceTable() {
            closeTableModal();
            practiceCorrect = 0;
            practiceWrong = 0;
            practiceQuestions = [];
            practiceIndex = 0;
            
            for (let i = 1; i <= 10; i++) {
                practiceQuestions.push({ num1: currentTable, num2: i });
            }
            practiceQuestions = shuffleArray(practiceQuestions);
            
            updatePracticeScore();
            showScreen('practice');
            nextPracticeQuestion();
        }
        
        function nextPracticeQuestion() {
            if (practiceIndex >= practiceQuestions.length) {
                practiceQuestions = shuffleArray(practiceQuestions);
                practiceIndex = 0;
            }
            
            const q = practiceQuestions[practiceIndex];
            document.getElementById('practiceTableLabel').textContent = `Tabla del ${currentTable}`;
            document.getElementById('practiceNum1').textContent = q.num1;
            document.getElementById('practiceNum2').textContent = q.num2;
            document.getElementById('practiceAnswer').textContent = '?';
            
            const correct = q.num1 * q.num2;
            let options = [correct];
            
            while (options.length < 4) {
                const wrong = correct + (Math.floor(Math.random() * 20) - 10);
                if (wrong > 0 && wrong !== correct && !options.includes(wrong)) {
                    options.push(wrong);
                }
            }
            options = shuffleArray(options);
            
            const container = document.getElementById('practiceOptions');
            container.innerHTML = '';
            
            const colors = ['from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600'];
            
            options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = `game-btn bg-gradient-to-br ${colors[i]} p-5 rounded-2xl text-white text-3xl title-font shadow-lg`;
                btn.textContent = opt;
                btn.onclick = () => checkPracticeAnswer(opt, correct);
                container.appendChild(btn);
            });
            
            document.getElementById('practiceFeedback').classList.add('hidden');
        }
        
        function checkPracticeAnswer(selected, correct) {
            const feedback = document.getElementById('practiceFeedback');
            feedback.classList.remove('hidden');
            
            if (selected === correct) {
                document.getElementById('practiceAnswer').textContent = correct;
                feedback.textContent = '¡Excelente! 🎉⭐';
                feedback.className = 'mt-6 text-2xl text-green-600 animate-celebrate';
                practiceCorrect++;
                speak('¡Muy bien!');
                createStars();
            } else {
                feedback.textContent = `Era ${correct}. ¡Sigue intentando! 💪`;
                feedback.className = 'mt-6 text-2xl text-orange-500 animate-shake';
                practiceWrong++;
                speak(`Era ${correct}`);
            }
            
            updatePracticeScore();
            practiceIndex++;
            setTimeout(nextPracticeQuestion, 1500);
        }
        
        function updatePracticeScore() {
            document.getElementById('practiceCorrect').textContent = practiceCorrect;
            document.getElementById('practiceWrong').textContent = practiceWrong;
        }
        
        // Quiz
        function startQuiz() {
            quizScore = 0;
            quizCombo = 0;
            quizCorrect = 0;
            quizWrong = 0;
            quizIndex = 0;
            quizQuestions = [];
            
            for (let i = 0; i < QUIZ_TOTAL; i++) {
                const num1 = Math.floor(Math.random() * 10) + 1;
                const num2 = Math.floor(Math.random() * 10) + 1;
                quizQuestions.push({ num1, num2 });
            }
            
            updateQuizUI();
            nextQuizQuestion();
        }
        
        function nextQuizQuestion() {
            if (quizIndex >= QUIZ_TOTAL) {
                showQuizResults();
                return;
            }
            
            const q = quizQuestions[quizIndex];
            document.getElementById('quizNum1').textContent = q.num1;
            document.getElementById('quizNum2').textContent = q.num2;
            document.getElementById('quizQuestionNum').textContent = quizIndex + 1;
            document.getElementById('quizProgress').style.width = `${(quizIndex / QUIZ_TOTAL) * 100}%`;
            
            const correct = q.num1 * q.num2;
            let options = [correct];
            
            while (options.length < 4) {
                const wrong = correct + (Math.floor(Math.random() * 20) - 10);
                if (wrong > 0 && wrong !== correct && !options.includes(wrong)) {
                    options.push(wrong);
                }
            }
            options = shuffleArray(options);
            
            const container = document.getElementById('quizOptions');
            container.innerHTML = '';
            
            const colors = ['from-cyan-400 to-cyan-600', 'from-lime-400 to-lime-600', 'from-amber-400 to-amber-600', 'from-fuchsia-400 to-fuchsia-600'];
            
            options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = `game-btn bg-gradient-to-br ${colors[i]} p-5 rounded-2xl text-white text-3xl title-font shadow-lg`;
                btn.textContent = opt;
                btn.onclick = () => checkQuizAnswer(opt, correct);
                container.appendChild(btn);
            });
            
            document.getElementById('quizFeedback').classList.add('hidden');
        }
        
        function checkQuizAnswer(selected, correct) {
            const feedback = document.getElementById('quizFeedback');
            feedback.classList.remove('hidden');
            
            if (selected === correct) {
                quizCombo++;
                const points = 10 * (quizCombo > 3 ? 2 : 1);
                quizScore += points;
                quizCorrect++;
                
                feedback.innerHTML = quizCombo > 3 ? 
                    `¡COMBO x2! +${points} puntos 🔥🔥` : 
                    '¡Correcto! +10 puntos ⭐';
                feedback.className = 'mt-6 text-2xl text-green-600 animate-celebrate';
                
                speak('¡Correcto!');
                createStars();
            } else {
                quizCombo = 0;
                quizWrong++;
                feedback.textContent = `Era ${correct} 😅`;
                feedback.className = 'mt-6 text-2xl text-orange-500';
                speak(`Era ${correct}`);
            }
            
            updateQuizUI();
            quizIndex++;
            setTimeout(nextQuizQuestion, 1200);
        }
        
        function updateQuizUI() {
            document.getElementById('quizScore').textContent = quizScore;
            document.getElementById('quizCombo').textContent = quizCombo;
            document.getElementById('quizTotalQuestions').textContent = QUIZ_TOTAL;
        }
        
        function showQuizResults() {
            document.getElementById('resultCorrect').textContent = quizCorrect;
            document.getElementById('resultWrong').textContent = quizWrong;
            document.getElementById('resultScore').textContent = quizScore;
            
            const percentage = (quizCorrect / QUIZ_TOTAL) * 100;
            let message = '';
            
            if (percentage === 100) {
                message = '¡PERFECTO! ¡Eres un genio de las matemáticas! 🏆🌟';
            } else if (percentage >= 80) {
                message = '¡Excelente trabajo! ¡Casi perfecto! 🎉';
            } else if (percentage >= 60) {
                message = '¡Muy bien! Sigue practicando 💪';
            } else {
                message = '¡No te rindas! Practica más y mejorarás 🌈';
            }
            
            document.getElementById('resultMessage').textContent = message;
            showScreen('quizResults');
            speak(message);
            createConfetti();
        }
        
        // Contrarreloj
        function startChallenge() {
            challengeTime = 60;
            challengeScore = 0;
            challengeCombo = 0;
            
            document.getElementById('challengeScore').textContent = '0';
            document.getElementById('challengeTimer').textContent = '60';
            document.getElementById('challengeCombo').classList.add('hidden');
            
            if (challengeTimer) clearInterval(challengeTimer);
            
            challengeTimer = setInterval(() => {
                challengeTime--;
                document.getElementById('challengeTimer').textContent = challengeTime;
                
                if (challengeTime <= 10) {
                    document.getElementById('challengeTimer').classList.add('animate-countdown');
                }
                
                if (challengeTime <= 0) {
                    endChallenge();
                }
            }, 1000);
            
            nextChallengeQuestion();
            document.getElementById('challengeInput').focus();
        }
        
        function nextChallengeQuestion() {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            currentChallengeAnswer = num1 * num2;
            
            document.getElementById('challengeNum1').textContent = num1;
            document.getElementById('challengeNum2').textContent = num2;
            document.getElementById('challengeInput').value = '';
            document.getElementById('challengeInput').focus();
            document.getElementById('challengeFeedback').classList.add('hidden');
        }
        
        function handleChallengeKeypress(event) {
            if (event.key === 'Enter') {
                checkChallengeAnswer();
            }
        }
        
        function checkChallengeAnswer() {
            const input = document.getElementById('challengeInput');
            const answer = parseInt(input.value);
            const feedback = document.getElementById('challengeFeedback');
            
            if (isNaN(answer)) return;
            
            feedback.classList.remove('hidden');
            
            if (answer === currentChallengeAnswer) {
                challengeCombo++;
                const multiplier = Math.min(challengeCombo, 5);
                const points = 10 * multiplier;
                challengeScore += points;
                
                feedback.textContent = `+${points} 🎯`;
                feedback.className = 'mt-4 text-2xl text-green-500';
                
                if (challengeCombo >= 3) {
                    document.getElementById('challengeCombo').classList.remove('hidden');
                    document.getElementById('comboMultiplier').textContent = multiplier;
                }
                
                createStars();
            } else {
                challengeCombo = 0;
                feedback.textContent = `Era ${currentChallengeAnswer} ❌`;
                feedback.className = 'mt-4 text-2xl text-red-500';
                document.getElementById('challengeCombo').classList.add('hidden');
            }
            
            document.getElementById('challengeScore').textContent = challengeScore;
            setTimeout(nextChallengeQuestion, 500);
        }
        
        function endChallenge() {
            if (challengeTimer) clearInterval(challengeTimer);
            
            speak(`¡Tiempo! Conseguiste ${challengeScore} puntos`);
            alert(`⏱️ ¡Tiempo!\n\n⭐ Puntos: ${challengeScore}\n\n¡Buen trabajo!`);
            showScreen('main');
        }
        
        // Batalla
        function startBattle() {
            playerHealth = 100;
            battleWins = 0;
            spawnMonster();
            updateBattleUI();
        }
        
        function spawnMonster() {
            currentMonster = { ...monsters[Math.floor(Math.random() * monsters.length)] };
            currentMonster.currentHealth = currentMonster.health;
            monsterHealth = currentMonster.health;
            
            document.getElementById('monsterEmoji').textContent = currentMonster.emoji;
            document.getElementById('monsterName').textContent = currentMonster.name;
            document.getElementById('monsterHealth').textContent = currentMonster.currentHealth;
            document.getElementById('monsterHealthBar').style.width = '100%';
            
            speak(`¡Apareció ${currentMonster.name}!`);
            nextBattleQuestion();
        }
        
        function nextBattleQuestion() {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            currentBattleAnswer = num1 * num2;
            
            document.getElementById('battleNum1').textContent = num1;
            document.getElementById('battleNum2').textContent = num2;
            
            let options = [currentBattleAnswer];
            while (options.length < 4) {
                const wrong = currentBattleAnswer + (Math.floor(Math.random() * 20) - 10);
                if (wrong > 0 && wrong !== currentBattleAnswer && !options.includes(wrong)) {
                    options.push(wrong);
                }
            }
            options = shuffleArray(options);
            
            const container = document.getElementById('battleOptions');
            container.innerHTML = '';
            
            const colors = ['from-red-400 to-red-600', 'from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-yellow-400 to-yellow-600'];
            
            options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = `game-btn bg-gradient-to-br ${colors[i]} p-4 rounded-xl text-white text-2xl title-font shadow-lg`;
                btn.textContent = opt;
                btn.onclick = () => checkBattleAnswer(opt);
                container.appendChild(btn);
            });
            
            document.getElementById('battleFeedback').classList.add('hidden');
        }
        
        function checkBattleAnswer(selected) {
            const feedback = document.getElementById('battleFeedback');
            feedback.classList.remove('hidden');
            
            if (selected === currentBattleAnswer) {
                // Atacar monstruo
                const damage = 20 + Math.floor(Math.random() * 15);
                currentMonster.currentHealth -= damage;
                
                feedback.innerHTML = `⚔️ ¡Atacaste! -${damage} HP`;
                feedback.className = 'mt-4 text-xl text-green-400';
                
                document.getElementById('monsterEmoji').classList.add('animate-shake');
                setTimeout(() => document.getElementById('monsterEmoji').classList.remove('animate-shake'), 500);
                
                if (currentMonster.currentHealth <= 0) {
                    currentMonster.currentHealth = 0;
                    battleWins++;
                    updateBattleUI();
                    speak('¡Victoria!');
                    createConfetti();
                    
                    setTimeout(() => {
                        alert(`🏆 ¡Derrotaste a ${currentMonster.name}!\n\nVictorias: ${battleWins}`);
                        spawnMonster();
                    }, 500);
                    return;
                }
                
                speak('¡Buen golpe!');
            } else {
                // El monstruo ataca
                const damage = 10 + Math.floor(Math.random() * 10);
                playerHealth -= damage;
                
                feedback.innerHTML = `💥 ¡Te atacaron! -${damage} HP. Era ${currentBattleAnswer}`;
                feedback.className = 'mt-4 text-xl text-red-400';
                
                if (playerHealth <= 0) {
                    playerHealth = 0;
                    updateBattleUI();
                    speak('¡Perdiste!');
                    
                    setTimeout(() => {
                        alert(`💀 ¡Fuiste derrotado!\n\nVictorias totales: ${battleWins}`);
                        showScreen('main');
                    }, 500);
                    return;
                }
                
                speak('¡Auch!');
            }
            
            updateBattleUI();
            setTimeout(nextBattleQuestion, 1000);
        }
        
        function updateBattleUI() {
            document.getElementById('playerHealth').textContent = playerHealth;
            document.getElementById('battleWins').textContent = battleWins;
            
            if (currentMonster) {
                document.getElementById('monsterHealth').textContent = Math.max(0, currentMonster.currentHealth);
                const healthPercent = (currentMonster.currentHealth / currentMonster.health) * 100;
                document.getElementById('monsterHealthBar').style.width = `${Math.max(0, healthPercent)}%`;
            }
        }
        
        // Utilidades
        function shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }
        
        function createStars() {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.textContent = ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];
                    star.style.left = Math.random() * window.innerWidth + 'px';
                    star.style.top = Math.random() * window.innerHeight + 'px';
                    star.style.fontSize = (Math.random() * 30 + 20) + 'px';
                    star.style.transition = 'all 1s ease-out';
                    star.style.opacity = '1';
                    document.body.appendChild(star);
                    
                    setTimeout(() => {
                        star.style.opacity = '0';
                        star.style.transform = 'scale(2)';
                    }, 100);
                    
                    setTimeout(() => star.remove(), 1100);
                }, i * 80);
            }
        }
        
        function createConfetti() {
            const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🏆', '⭐'];
            for (let i = 0; i < 25; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    confetti.style.left = Math.random() * window.innerWidth + 'px';
                    confetti.style.top = '-50px';
                    confetti.style.fontSize = (Math.random() * 25 + 15) + 'px';
                    confetti.style.transition = 'all 2.5s ease-out';
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => {
                        confetti.style.top = window.innerHeight + 50 + 'px';
                        confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
                    }, 10);
                    
                    setTimeout(() => confetti.remove(), 2500);
                }, i * 40);
            }
        }
        
        // Cerrar modal con click fuera
        document.getElementById('tableModal').addEventListener('click', function(e) {
            if (e.target === this) closeTableModal();
        });
        
        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                speak('¡Bienvenido! ¿Listo para aprender las tablas de multiplicar?');
            }, 500);
        });