import Flow from "@/components/flow";
import Head from "next/head";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const alreadyWatchTutorial = !!localStorage.getItem(
      "already-watch-tutorial"
    );
    if (!alreadyWatchTutorial) {
      const driverObj = driver({
        popoverClass: "driverjs-theme",
        showProgress: true,
        steps: [
          {
            popover: { title: "Tutorial rápido", description: `Esse é o editor demo de um projeto que ainda está em construção e não tem nenhuma integração a nenhum serviço de mensagens no momento. É somente uma das etapas de sua construção.
            A seguir você irá ver um tutorial rápido de uso.` },
          },
          {
            popover: {title: "Nós", description: `No lado esquerdo você pode encontrar os nós. No computador você pode arrasta-los e solta-los no editor para criar. No smartphone basta clicar neles. Cada Nó é capaz de desempenhar uma função única na construção.` },
          },
          {
            popover: {title: "Atalhos", description: `No lado direito você encontrará atalhos rápidos para: Salvar, recarregar, desfazer, refazer, zoom, play para testar, exportar e importar` },
          },
          {
            popover: {title: "Edição", description: `Nós selecionados exibirão uma lixeira onde podem ser excluidos junto com um highlight azul. Também poderão ser excluidos usando backspace.` },
          },
          {
            popover: {title: "Conectar", description: `Para conectar os nós, basta clicar de um ponto a outro nos Nós, ou clicar e arrastar os mesmos.` },
          },
          {
            popover: {title: "Construção", description: `Ao clicar no conteúdo de um nó, você poderá edita-lo. Para usar váriaveis em campos necessários você deve envolve-lâ em {{nome da variavel}}, para que dessa forma seja substituida. Os campos para definir o salvamento de uma váriavel não preciam disso` },
          },
          {
            popover: {title: "Construção Avançada", description: `Chamar e definir váriaveis podem usar como valor outras váriaveis. Exemplo, ao definir o nome de salvamento de uma váriavel posso usar: Nome, dai salva-lá em Nome, ou então {{Nome}}, dai será salva numa variavel de nome do valor da variavel Nome. Isso também vale para exibir os textos, como {{Nome}} para a variavel direta, ou {{{{Nome}}}} buscando uma váriavel de nome no valor presente em {{Nome}}` },
          },
          {
            popover: {title: "Report", description: `Como informado, o projeto está em construção e esse é somente um de seus componentes em testes, por favor, reporte o que você acha que está errado ou alguma feature que pode ser implementada em https://tabnews.com.br/founty/` },
          },
          {
            popover: {title: "Carrinho", description: `Para acessar a váriavel referente ao carrinho e ao valor do carrinho, você poderá usar {{CART_DATA}} e {{CART_VALUE}}, quando necessário.` },
          },
        ],
      });
      driverObj.drive();
      localStorage.setItem("already-watch-tutorial", 'true');
    }
  }, []);

  return (
    <div className="w-full h-[100vh]">
      <Head>
        <title>BatAnBot - Internal Editor v-0.1.0</title>
      </Head>
      <Flow />
    </div>
  );
}
