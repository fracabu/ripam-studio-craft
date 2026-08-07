@echo off
REM ============================================================================
REM Purga giornaliera del buffer messaggi Telegram (retention 7 giorni).
REM
REM Perche' esiste come .cmd e non come riga in schtasks: il path di node sta
REM sotto "Program Files", e passare a schtasks un comando con spazi + due
REM argomenti quotati fallisce ("Opzione o argomento non valido"). Un wrapper
REM risolve il quoting una volta sola.
REM
REM Registrato in Utilita' di pianificazione come "RipamCraft - Purga buffer
REM Telegram", ogni giorno alle 03:30. Gira solo a PC acceso: se la macchina
REM resta spenta il task recupera al primo avvio utile (/RU con /Z non serve,
REM la purga e' idempotente — cancella tutto cio' che ha superato i 7 giorni).
REM
REM ⚠️ Non e' un dettaglio operativo: in telegram_messaggi ci sono i messaggi di
REM 1.814 persone. La finestra di 7 giorni dichiarata nello schema esiste solo
REM se questo task gira davvero.
REM ============================================================================
cd /d "%~dp0.."
node scripts\telegram_buffer.mjs --purga
