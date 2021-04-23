import {createContext, ReactNode, useContext, useState} from 'react'

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

type PlayerContextData = {
  episodeList: Array<Episode>;
  currentEpisodeIndex: number;
  isPlaying : boolean;
  isLooping: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void;
  togglePlay : () =>void;
  toggleLoop: () =>void;
  toggleShuffle: () =>void;
  playNext : () => void;
  playPrevious : () => void;
  setPlayingState: (state : boolean) => void;
  claarPlayerState: () =>void;
  playList: (list: Episode[], index: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
};

type PlayerContextProviderProps = {
  //Qualquer coisa que o react aceita sendo conteúdo JSX
  children: ReactNode;
}

//O parametro do contexto pode ser qualquer dado, é
//só o indicativo de qual tipo de dado ele vai ter
export const PlayerContext = createContext( {} as PlayerContextData);

export function PlayerContextProvider({children} : PlayerContextProviderProps) {
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  function play(episode : Episode) {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }

  function playList(list: Episode[], index: number) {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function togglePlay(){
    setIsPlaying(!isPlaying);
  }
  
  function toggleLoop(){
    setIsLooping(!isLooping);
  }
  
  function toggleShuffle(){
    setIsShuffling(!isShuffling);
  }

  function setPlayingState(state : boolean){
    setIsPlaying(state);
  }

  function claarPlayerState() {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0)
  }

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

  function playNext() {
    if(isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    }
    else if(hasNext){
      setCurrentEpisodeIndex(currentEpisodeIndex + 1)
    }
  }

  function playPrevious() {
    if(hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1)
    }
  }

  return (
    //Compartilhamento de dados entre os componentes
    //Que estão dentro do Contexto criado
    <PlayerContext.Provider value={
      {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        play,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        claarPlayerState,
        playList,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious
      }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  return useContext(PlayerContext);
}