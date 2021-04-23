import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link'
import Image from 'next/image';
import Head from 'next/head';
//import {useRouter} from 'next/router';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { usePlayer } from '../../contexts/PlayerContext';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../Utils/convertDurationToTimeString';

import styles from '../../styles/episode.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  description: string;
  url: string;
}

type EpisodeProps = {
  episode:Episode;
}


export default function Episode({episode} : EpisodeProps){
  
  const { play } = usePlayer();
  //const router = useRouter();

  //Isso aqui só é necessário se o fallback for true (lado cliente)
  //La no GetStaticPaths()
  //if(router.isFallback)
    //return <p>Carregando ...</p>

  return (
    <div className={styles.episode}>
      <Head>
        <title>
          {episode.title}
        </title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href={'/'}>
          <button type="button">
            <img src="/arrow-left.svg" alt="Votlar"/>
          </button>
        </Link>
        <Image 
          width={785}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={()=> play(episode)}>
          <img src="/play.svg" alt="Tocar episódio"/>
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}}/>
    </div>
  )
}

export const getStaticPaths : GetStaticPaths = async () =>{
  const {data} = await api.get('episodes', {
    params:{
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const paths = data.map(episode =>{
    return {
      //para passar dentro do paths, precisa estar
      //encapsulado em params {}
      params:{
        //slug porque o nome do param da página é slug
        slug: episode.id
      }
    }
  })

  return {
    paths: paths,
    //fallback false não renderiza novas páginas fora do array "paths" (retorna 404)
    //fallback true renderiza as páginas tanto do array quanto fora, mas no lado do cliente
    //fallback blocking renderiza como o true acima mas no lado do next (servidor node.js)
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async(context) =>{
  const {slug} = context.params;
  const {data} = await api.get(`/episodes/${slug}`);

  const episode = { 
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }

  return {
    props:{episode},
    revalidate: 60* 60 * 24, //24hrs
  }
}