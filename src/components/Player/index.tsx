import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../Utils/convertDurationToTimeString';

export function Player() {
  //para manipulação de elementos nativos HTML
  //usando o React podemos malipular com refs
  //basta passar como tipagem dinamica o HTML... 
  //elemento de manipulação
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  //usando os recursos disponíveis no contexto
  const {
    episodeList, 
    currentEpisodeIndex, 
    isPlaying, 
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    claarPlayerState,
    playNext,
    playPrevious,
    hasPrevious,
    hasNext
  } = usePlayer();

  //manipulando a alteração da variavel isPlaying, toda vez que ela
  //mudar a arrow function será executada
  useEffect(()=>{
    if(!audioRef.current){
      return;
    }

    if(isPlaying){
      audioRef.current.play();
    }else{
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate' , () => {
      setProgress(Math.floor(audioRef.current.currentTime))
    })
  }

  function handleSeek(duration: number) {
    audioRef.current.currentTime = duration;
    setProgress(duration);
  }

  function handleEpisodeEnded() {
    if(hasNext){
      playNext()
    }else{
      claarPlayerState()
    }
  }

  const playingEpisode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"/>
        <strong>Tocando agora</strong>
      </header>

      { playingEpisode ? (
          <div className={styles.currentEpisode}>
            <Image
              width={592}
              height={592}
              src={playingEpisode.thumbnail}
              objectFit="cover"
            />

            <strong>{playingEpisode.title}</strong>
            <span>{playingEpisode.members}</span>
          </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}
     

      <footer className={!playingEpisode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {
              playingEpisode ? (
                <Slider
                  max={playingEpisode.duration}
                  value={progress}
                  onChange={handleSeek}
                  trackStyle={{backgroundColor: '#04d361'}}
                  railStyle={{backgroundColor: '#9F75FF'}}
                  handleStyle={{borderColor: '#04d361'}}
                />
              ) : (
                <div className={styles.emptySlider}/>
              )
            }
            
          </div>
          <span>{convertDurationToTimeString(playingEpisode?.duration ?? 0)}</span>
        </div>

        {playingEpisode && (
          <audio 
            src={playingEpisode.url}
            ref={audioRef}
            autoPlay
            onEnded={handleEpisodeEnded}
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        ) }

        <div className={styles.buttons}>
          <button 
          type="button" 
          disabled={!playingEpisode || episodeList.length === 1}
          onClick={toggleShuffle}
          className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar"/>
          </button>

          <button type="button"  disabled={!playingEpisode || !hasPrevious} onClick={playPrevious}>
            <img src="/play-previous.svg" alt="Tocar Anterior"/>
          </button>

          <button 
          type="button" 
          className={styles.playButton}  
          disabled={!playingEpisode}
          onClick={togglePlay}>
            { 
              !isPlaying ?
              <img src= '/play.svg' alt="Tocar"/>  :
              <img src= '/pause.svg' alt="Pausar"/> 
            }
          </button>

          <button type="button"  disabled={!playingEpisode || !hasNext} onClick={playNext}>
            <img src="/play-next.svg" alt="Tocar Próxima"/>
          </button>

          <button 
          type="button"  
          onClick={toggleLoop}
          className={isLooping ? styles.isActive : ''}
          disabled={!playingEpisode}>
            <img src="/repeat.svg" alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
  );
}