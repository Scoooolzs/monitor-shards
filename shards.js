/* Monitor Status de Shards - Discord Bots 
*
* Dev: GM#3078 (arturdealcantara)
* Propósito: Mostrar o status dos shards separadamente, tendo em vista saber através do ID, tempo de execução, ping, quantidade de usuários e guilds por fragmento.
* OBS.: A tabela suporta apenas 6 colunas.
* Outros.: Foi desenvolvido para o ZabbiX#7853, um excelente bot para discord.
* Informações adicionais: Me procura no meu servidor, link na bio do Github.
*/

// Package usado para criar a TABELA "npm i ascii-table".
const AsciiTable = require('ascii-table')
// Defina um título se quiser, se não, deixe vazio ().
const table = new AsciiTable('ZabbiX Shards')

try {

    /* 
    * Título da COLUNA;
    * São suportados 6 colunas por tabela;
    * Se quiser, pode por paginação.
    */
    table.setHeading('SID', 'Guilds', 'Users', 'UpTime', 'Ping', 'Status')

    // Necessário para centralizar o Row na tabela
    table.setAlign(0, AsciiTable.CENTER)
    table.setAlign(1, AsciiTable.CENTER)
    table.setAlign(2, AsciiTable.CENTER)
    table.setAlign(3, AsciiTable.CENTER)
    table.setAlign(4, AsciiTable.CENTER)
    table.setAlign(5, AsciiTable.CENTER)

    // Não é necessário essa próxima linha, a tabela já vem pronta.
    table.setBorder('|', '-', '+', '+')

    // Busca por algumas informações, para preencher a tabela.
    const uptime = await this.client.shard.broadcastEval(() => this.uptime)
    const ping = await this.client.shard.broadcastEval(() => parseFloat(this.ws.ping))

    const guildsEval = await this.client.shard.broadcastEval(g => g.guilds.cache.size)
    // Note que não fiz o tratamento de remover os bots da contagem, no caso é o total de usuários + bots.
    const usersEval = await this.client.shard.broadcastEval(u => u.users.cache.size)

    // Subistitui o status retornado (NUMBER), por texto legível.
    const status = {
        0: 'OK',
        1: 'CONECTANDO',
        2: 'RECONECTANDO',
        3: 'OCIOSO',
        4: 'INICIALIZANDO',
        5: 'DESCONECTADO',
        6: 'ESPERANDO GUILDS',
        7: 'IDENTIFICANDO',
        8: 'RETOMANDO'
    }

    /* 
    * Para que seja criado os Rows (linhas da tabela), é necessário o FOR, passando o parâmetro com o máx '< (menor que) shardCount'.
    * Para que crie exatamente a quantidade correta de Rows.
    */
    for (let i = 0; i < this.client.options.shardCount; i++) {

        let pings = Math.round(ping[i]) > 999 ? '999+' : Math.round(ping[i]),
            stats = status[this.client.ws.status]

        // Cada coluna é preenchida com uma informação, então cada informação deve estar no lugar correto. As colunas são separadas por ',' (vírgula).
        table.addRow(i, guildsEval[i].toLocaleString('pt-BR'), usersEval[i].toLocaleString('pt-BR'), parseDur(uptime[i]), '~' + pings + 'ms', stats)
    }
    //O reduce busca reduzir um array. Ele iterará por cada elemento dessa lista com o objetivo de ao final gerar um único valor. Em resumo soma todos os resultados dos fragmentos.
    const botGuilds = guildsEval.reduce((prev, val) => prev + val, 0)
    const botUsers = usersEval.reduce((prev, val) => prev + val, 0)

    const media = await this.client.shard.broadcastEval(() => Math.round(this.ws.ping))
    const ping_media = media.reduce((prev, val) => prev + val / this.client.options.shardCount)

    // Aqui definimos um Row vazio ou complementado por algum simbolo.
    table.addRow('______', '______', '______', '______', '______', '______')

    // Essa é a última linha da TABELA, então seria o resultado da soma ou média dos valores mostrados las linhas anteriores.
    table.addRow('TOTAL', botGuilds.toLocaleString('pt-BR'), botUsers.toLocaleString('pt-BR'), 'MÉDIA', '~' + Math.round(ping_media) > 999 ? '999+' : Math.round(ping_media) + 'ms', ' - ')

    /* 
    *Essa parte é a mais esperada, que envia de fato a TABELA, no canal onde foi usado o comando. 
    *NOTA: "Eu particularmente, tentei por em embed, não funciona bem, fica quebrado."
    * O "prolog", nada mais é que um Markdown (Markdown é uma linguagem simples de marcação originalmente criada por John Gruber e Aaron Swartz. Markdown converte seu texto em HTML válido)  
    */
    interaction.reply(`\`\`\`prolog
${table.toString()}\`\`\` * *"»" informa qual o Shard a Guild é atendida pelo sistema do ${this.client.user.username}.*`)

    // É necessário limpar os Rows, sempre, depois de usar o comando, caso não limpe, as informações ficam se sobrepondo.
    table.clearRows()

} catch (error) {
    console.log(error)
}

    // Funcão responsável por formatar o Uptime de cada fragmento, em Dias, Horas, Minutos e Segundos.
function parseDur(ms) {
    let seconds = ms / 1000;

    let days = parseInt(seconds / 86400);
    seconds = seconds % 86400;

    let hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;

    let minutes = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);

    if (days) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    else if (hours) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    else if (minutes) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
