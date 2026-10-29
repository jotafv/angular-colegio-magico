import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TipoHechizo = 'Ataque' | 'Defensa' | 'Sanacion';
export type EstadoDuelo = 'PREPARACION' | 'EN_CURSO' | 'VICTORIA' | 'DERROTA';
export type Dificultad = 'Aprendiz' | 'Auror' | 'Mago Tenebroso';
export type NombreCasa = 'Gryffindor' | 'Slytherin' | 'Ravenclaw' | 'Hufflepuff';

export interface HechizoDuelo {
  id: number;
  nombre: string;
  emoji: string;
  tipo: TipoHechizo;
  poder: number;
  costoEnergia: number;
  cooldown: number;
  descripcion: string;
  aturde?: boolean;
}

export interface RegistroTurno {
  turno: number;
  emisor: string;
  hechizo: string;
  efecto: string;
  tipo: 'damage' | 'shield' | 'heal' | 'info';
}

export interface Casa {
  nombre: NombreCasa;
  emoji: string;
  color: string;
  bonus: string;
}

export interface Rival {
  nombre: string;
  emoji: string;
  frase: string;
  hechizos: { nombre: string; tipo: TipoHechizo; poder: number; costo: number }[];
}

export interface TextoFlotante {
  id: number;
  texto: string;
  objetivo: 'mago' | 'rival';
  clase: 'damage' | 'heal' | 'shield' | 'crit';
}

@Component({
  selector: 'app-artefacto-creativo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './artefacto-creativo.component.html',
  styleUrl: './artefacto-creativo.component.css'
})
export class ArtefactoCreativoComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  // ===================== ESTADO INTERACTIVO (usado con [(ngModel)]) =====================
  nombreMago: string = 'Harry Potter';
  casaSeleccionada: NombreCasa = 'Gryffindor';
  dificultad: Dificultad = 'Aprendiz';
  indiceRival: number = 0;

  saludMago: number = 100;
  energiaMago: number = 100;
  escudoMago: number = 0;

  saludRival: number = 100;
  energiaRival: number = 100;
  escudoRival: number = 0;

  estadoDuelo: EstadoDuelo = 'PREPARACION';
  numeroTurno: number = 1;
  arenaOscura: boolean = false;
  turnoRivalActivo: boolean = false;
  rivalAturdido: boolean = false;

  racha: number = 0;
  mejorRacha: number = 0;
  puntuacion: number = 0;
  frasePantalla: string = '¡Elige tu casa, tu rival y que comience el duelo!';

  magoGolpeado: boolean = false;
  rivalGolpeado: boolean = false;
  pantallaTiembla: boolean = false;
  textosFlotantes: TextoFlotante[] = [];

  // ===================== DATOS =====================
  casas: Casa[] = [
    { nombre: 'Gryffindor', emoji: '🦁', color: '#c0392b', bonus: '+20% de daño en ataques' },
    { nombre: 'Slytherin', emoji: '🐍', color: '#27ae60', bonus: '30% de probabilidad de golpe crítico' },
    { nombre: 'Ravenclaw', emoji: '🦅', color: '#2980b9', bonus: 'Recargas +4 de energía cada 2 segundos' },
    { nombre: 'Hufflepuff', emoji: '🦡', color: '#f1c40f', bonus: 'Tus curaciones valen +50%' }
  ];

  rivales: Rival[] = [
    {
      nombre: 'Draco Malfoy', emoji: '🧪', frase: '¡Mi padre se va a enterar de esto!',
      hechizos: [
        { nombre: 'Serpensortia', tipo: 'Ataque', poder: 18, costo: 20 },
        { nombre: 'Rictusempra', tipo: 'Ataque', poder: 14, costo: 12 },
        { nombre: 'Protego', tipo: 'Defensa', poder: 18, costo: 15 }
      ]
    },
    {
      nombre: 'Bellatrix Lestrange', emoji: '🗡️', frase: '¡Crucio, mi pequeño! Jajajaja...',
      hechizos: [
        { nombre: 'Crucio', tipo: 'Ataque', poder: 28, costo: 30 },
        { nombre: 'Incendio', tipo: 'Ataque', poder: 20, costo: 18 },
        { nombre: 'Protego', tipo: 'Defensa', poder: 22, costo: 15 }
      ]
    },
    {
      nombre: 'Lord Voldemort', emoji: '💀', frase: 'No hay bien ni mal, solo poder...',
      hechizos: [
        { nombre: 'Avada Kedavra (debilitado)', tipo: 'Ataque', poder: 32, costo: 40 },
        { nombre: 'Fiendfyre', tipo: 'Ataque', poder: 24, costo: 25 },
        { nombre: 'Horrocrux', tipo: 'Sanacion', poder: 22, costo: 30 }
      ]
    }
  ];

  hechizosDuelo: HechizoDuelo[] = [
    { id: 1, nombre: 'Expelliarmus', emoji: '🔴', tipo: 'Ataque', poder: 25, costoEnergia: 20, cooldown: 0, descripcion: 'Desarma al oponente con un rayo escarlata.' },
    { id: 2, nombre: 'Stupefy', emoji: '⚡', tipo: 'Ataque', poder: 35, costoEnergia: 35, cooldown: 2, descripcion: 'Aturde al rival con una potente onda expansiva.' },
    { id: 3, nombre: 'Petrificus Totalus', emoji: '🧊', tipo: 'Ataque', poder: 15, costoEnergia: 30, cooldown: 3, aturde: true, descripcion: 'Paraliza al rival: pierde su próximo turno.' },
    { id: 4, nombre: 'Expecto Patronum', emoji: '🦌', tipo: 'Ataque', poder: 50, costoEnergia: 55, cooldown: 4, descripcion: 'Tu Patronus embiste con toda su luz plateada.' },
    { id: 5, nombre: 'Protego', emoji: '🛡️', tipo: 'Defensa', poder: 30, costoEnergia: 15, cooldown: 1, descripcion: 'Escudo mágico que absorbe daño antes que tu vida.' },
    { id: 6, nombre: 'Episkey', emoji: '💚', tipo: 'Sanacion', poder: 22, costoEnergia: 25, cooldown: 2, descripcion: 'Restaura vitalidad y cura heridas menores.' }
  ];

  historialDuelo: RegistroTurno[] = [];
  cooldowns: { [idHechizo: number]: number } = {};

  private ambientMusicInterval: any = null;
  private timeouts: any[] = [];
  private contadorFlotantes = 0;

  // ===================== GETTERS PARA EL TEMPLATE =====================
  get rival(): Rival {
    return this.rivales[this.indiceRival] ?? this.rivales[0];
  }

  get casaActual(): Casa {
    return this.casas.find(c => c.nombre === this.casaSeleccionada) ?? this.casas[0];
  }

  get saludMagoBaja(): boolean {
    return this.saludMago <= 30;
  }

  get saludRivalBaja(): boolean {
    return this.saludRival <= 30;
  }

  get nombreValido(): boolean {
    return (this.nombreMago ?? '').trim().length >= 2;
  }

  // ===================== HELPER: setTimeout que repinta la vista =====================
  private programar(fn: () => void, ms: number): void {
    const t = setTimeout(() => {
      fn();
      this.cdr.markForCheck();
    }, ms);
    this.timeouts.push(t);
  }

  // ===================== LIFECYCLE: ngOnInit =====================
  ngOnInit(): void {
    console.log('🎨 Reto 7: Artefacto Creativo montado en el Gran Salón.');
    this.ambientMusicInterval = setInterval(() => {
      if (this.estadoDuelo === 'EN_CURSO') {
        const extra = this.casaSeleccionada === 'Ravenclaw' ? 4 : 2;
        this.energiaMago = Math.min(100, this.energiaMago + extra);
        this.energiaRival = Math.min(100, this.energiaRival + 2);
        this.cdr.markForCheck();
      }
    }, 2000);
  }

  // ===================== INICIAR DUELO =====================
  iniciarDuelo(): void {
    if (!this.nombreValido) {
      this.frasePantalla = '⚠️ Escribe un nombre de mago válido (mínimo 2 letras).';
      return;
    }
    this.limpiarTimeouts();
    this.estadoDuelo = 'EN_CURSO';
    this.saludMago = 100;
    this.energiaMago = 100;
    this.escudoMago = 0;
    this.saludRival = this.dificultad === 'Mago Tenebroso' ? 130 : 100;
    this.energiaRival = 100;
    this.escudoRival = 0;
    this.numeroTurno = 1;
    this.racha = 0;
    this.mejorRacha = 0;
    this.puntuacion = 0;
    this.rivalAturdido = false;
    this.turnoRivalActivo = false;
    this.textosFlotantes = [];
    this.cooldowns = {};
    this.frasePantalla = `${this.rival.emoji} ${this.rival.nombre}: "${this.rival.frase}"`;
    this.historialDuelo = [
      {
        turno: 1,
        emisor: 'Profesor Flitwick',
        hechizo: 'Apertura de Duelo',
        efecto: `¡Varitas en alto! ${this.nombreMago} de ${this.casaSeleccionada} ${this.casaActual.emoji} contra ${this.rival.nombre}. ¡Reverencia y comiencen!`,
        tipo: 'info'
      }
    ];
  }

  // ===================== LANZAR HECHIZO DEL JUGADOR =====================
  puedeLanzar(h: HechizoDuelo): boolean {
    return (
      this.estadoDuelo === 'EN_CURSO' &&
      !this.turnoRivalActivo &&
      this.energiaMago >= h.costoEnergia &&
      (this.cooldowns[h.id] ?? 0) === 0
    );
  }

  lanzarHechizo(h: HechizoDuelo): void {
    if (!this.puedeLanzar(h)) return;

    this.energiaMago -= h.costoEnergia;
    if (h.cooldown > 0) this.cooldowns[h.id] = h.cooldown + 1;

    if (h.tipo === 'Ataque') {
      let dano = h.poder;
      if (this.casaSeleccionada === 'Gryffindor') dano = Math.round(dano * 1.2);

      const critProb = this.casaSeleccionada === 'Slytherin' ? 0.3 : 0.12;
      const critico = Math.random() < critProb;
      if (critico) dano = Math.round(dano * 1.6);

      dano += Math.min(this.racha * 2, 10);

      const real = this.aplicarDano('rival', dano);
      this.racha++;
      this.mejorRacha = Math.max(this.mejorRacha, this.racha);
      this.puntuacion += real * 10 + this.racha * 5;
      this.animarGolpe('rival');
      this.mostrarTexto('rival', critico ? `💥 ¡CRÍTICO! -${real}` : `-${real}`, critico ? 'crit' : 'damage');

      if (h.aturde) {
        this.rivalAturdido = true;
      }

      this.registrar(
        this.nombreMago,
        `${h.emoji} ${h.nombre}`,
        `${critico ? '¡GOLPE CRÍTICO! ' : ''}Causa ${real} de daño a ${this.rival.nombre}${this.racha >= 3 ? ` (combo x${this.racha} 🔥)` : ''}${h.aturde ? ' y lo deja paralizado.' : '.'}`,
        'damage'
      );
    } else if (h.tipo === 'Sanacion') {
      let cura = h.poder;
      if (this.casaSeleccionada === 'Hufflepuff') cura = Math.round(cura * 1.5);
      const antes = this.saludMago;
      this.saludMago = Math.min(100, this.saludMago + cura);
      const real = this.saludMago - antes;
      this.racha = 0;
      this.puntuacion += real * 3;
      this.mostrarTexto('mago', `+${real} 💚`, 'heal');
      this.registrar(this.nombreMago, `${h.emoji} ${h.nombre}`, `Cura mágica: restaura ${real} puntos de vitalidad.`, 'heal');
    } else {
      this.escudoMago = Math.min(60, this.escudoMago + h.poder);
      this.mostrarTexto('mago', `🛡️ +${h.poder}`, 'shield');
      this.registrar(this.nombreMago, `${h.emoji} ${h.nombre}`, `Escudo activo (${this.escudoMago} de protección). ${h.descripcion}`, 'shield');
    }

    if (this.saludRival <= 0) {
      this.finalizarDuelo('VICTORIA');
      return;
    }

    this.turnoRival();
  }

  // ===================== MEDITAR (pasar turno y recuperar energía) =====================
  meditar(): void {
    if (this.estadoDuelo !== 'EN_CURSO' || this.turnoRivalActivo) return;
    this.energiaMago = Math.min(100, this.energiaMago + 30);
    this.racha = 0;
    this.mostrarTexto('mago', '+30 ⚡', 'heal');
    this.registrar(this.nombreMago, '🧘 Meditar', 'Respiras hondo y recuperas 30 de energía mágica.', 'info');
    this.turnoRival();
  }

  // ===================== TURNO DE LA IA RIVAL =====================
  private turnoRival(): void {
    this.turnoRivalActivo = true;

    this.programar(() => {
      try {
        if (this.estadoDuelo !== 'EN_CURSO') return;

        if (this.rivalAturdido) {
          this.rivalAturdido = false;
          this.registrar(this.rival.nombre, '🧊 Paralizado', `${this.rival.nombre} no puede moverse y pierde el turno.`, 'info');
          return;
        }

        const mult = this.dificultad === 'Aprendiz' ? 0.8 : this.dificultad === 'Auror' ? 1 : 1.25;
        const rivalSaludBaja = this.saludRival <= 35;

        const posibles = this.rival.hechizos.filter(s => this.energiaRival >= s.costo);
        let elegido = posibles[Math.floor(Math.random() * posibles.length)];

        if (rivalSaludBaja && this.dificultad !== 'Aprendiz') {
          const defensivo = posibles.find(s => s.tipo !== 'Ataque');
          if (defensivo) elegido = defensivo;
        }

        if (!elegido) {
          this.energiaRival = Math.min(100, this.energiaRival + 25);
          this.registrar(this.rival.nombre, '😮‍💨 Recarga', `${this.rival.nombre} está agotado y recupera el aliento.`, 'info');
          return;
        }

        this.energiaRival -= elegido.costo;

        if (elegido.tipo === 'Ataque') {
          const variacion = Math.floor(Math.random() * 8);
          const dano = Math.round((elegido.poder + variacion) * mult);
          const escudoAntes = this.escudoMago;
          const real = this.aplicarDano('mago', dano);
          this.racha = 0;
          this.animarGolpe('mago');
          this.mostrarTexto('mago', `-${real}`, 'damage');
          this.registrar(
            this.rival.nombre,
            elegido.nombre,
            `¡El rival contraataca! Te causa ${real} de daño${escudoAntes > 0 && this.escudoMago === 0 ? ' (tu escudo se rompió 💔)' : ''}.`,
            'damage'
          );
        } else if (elegido.tipo === 'Sanacion') {
          const antes = this.saludRival;
          this.saludRival = Math.min(100, this.saludRival + elegido.poder);
          const real = this.saludRival - antes;
          this.mostrarTexto('rival', `+${real} 💚`, 'heal');
          this.registrar(this.rival.nombre, elegido.nombre, `${this.rival.nombre} se regenera ${real} puntos de vida.`, 'heal');
        } else {
          this.escudoRival = Math.min(60, this.escudoRival + elegido.poder);
          this.mostrarTexto('rival', `🛡️ +${elegido.poder}`, 'shield');
          this.registrar(this.rival.nombre, elegido.nombre, `${this.rival.nombre} levanta un escudo de ${elegido.poder} puntos.`, 'shield');
        }

        if (this.saludMago <= 0) {
          this.finalizarDuelo('DERROTA');
        }
      } finally {
        // El turno SIEMPRE se cierra para que la batalla nunca se congele
        if (this.estadoDuelo === 'EN_CURSO') {
          this.cerrarRonda();
        } else {
          this.turnoRivalActivo = false;
        }
      }
    }, 900);
  }

  // ===================== HELPERS DE COMBATE =====================
  private aplicarDano(objetivo: 'mago' | 'rival', dano: number): number {
    if (objetivo === 'mago') {
      const absorbido = Math.min(this.escudoMago, dano);
      this.escudoMago -= absorbido;
      const real = dano - absorbido;
      this.saludMago = Math.max(0, this.saludMago - real);
      return real;
    }
    const absorbido = Math.min(this.escudoRival, dano);
    this.escudoRival -= absorbido;
    const real = dano - absorbido;
    this.saludRival = Math.max(0, this.saludRival - real);
    return real;
  }

  private cerrarRonda(): void {
    this.numeroTurno++;
    Object.keys(this.cooldowns).forEach(k => {
      const id = Number(k);
      if (this.cooldowns[id] > 0) this.cooldowns[id]--;
    });
    this.energiaRival = Math.min(100, this.energiaRival + 8);
    this.turnoRivalActivo = false;
  }

  private finalizarDuelo(resultado: 'VICTORIA' | 'DERROTA'): void {
    this.estadoDuelo = resultado;
    this.turnoRivalActivo = false;
    if (resultado === 'VICTORIA') {
      this.puntuacion += 500 + this.saludMago * 5;
      this.frasePantalla = `🏆 ¡${this.nombreMago} gana! +10 puntos para ${this.casaSeleccionada}.`;
      this.registrar('Profesor Flitwick', '🏆 Fin del duelo', `¡Magnífico! ${this.nombreMago} derrota a ${this.rival.nombre}.`, 'info');
    } else {
      this.frasePantalla = `💀 ${this.rival.nombre} te ha vencido. Madame Pomfrey ya viene...`;
      this.registrar('Madame Pomfrey', '🩹 Enfermería', `${this.nombreMago} cae derrotado. Unos días en la enfermería lo arreglan.`, 'info');
    }
  }

  private registrar(emisor: string, hechizo: string, efecto: string, tipo: RegistroTurno['tipo']): void {
    this.historialDuelo.unshift({ turno: this.numeroTurno, emisor, hechizo, efecto, tipo });
    if (this.historialDuelo.length > 30) this.historialDuelo.pop();
  }

  // ===================== ANIMACIONES =====================
  private animarGolpe(objetivo: 'mago' | 'rival'): void {
    if (objetivo === 'mago') this.magoGolpeado = true;
    else this.rivalGolpeado = true;
    this.pantallaTiembla = true;

    this.programar(() => {
      this.magoGolpeado = false;
      this.rivalGolpeado = false;
      this.pantallaTiembla = false;
    }, 450);
  }

  private mostrarTexto(objetivo: 'mago' | 'rival', texto: string, clase: TextoFlotante['clase']): void {
    const id = ++this.contadorFlotantes;
    this.textosFlotantes.push({ id, texto, objetivo, clase });
    this.programar(() => {
      this.textosFlotantes = this.textosFlotantes.filter(f => f.id !== id);
    }, 1200);
  }

  // ===================== UTILIDADES DE UI =====================
  toggleArena(): void {
    this.arenaOscura = !this.arenaOscura;
  }

  reiniciar(): void {
    this.limpiarTimeouts();
    this.estadoDuelo = 'PREPARACION';
    this.turnoRivalActivo = false;
    this.rivalAturdido = false;
    this.frasePantalla = '¡Elige tu casa, tu rival y que comience el duelo!';
    this.historialDuelo = [];
    this.textosFlotantes = [];
  }

  private limpiarTimeouts(): void {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  // ===================== LIFECYCLE: ngOnDestroy =====================
  ngOnDestroy(): void {
    if (this.ambientMusicInterval) {
      clearInterval(this.ambientMusicInterval);
    }
    this.limpiarTimeouts();
    console.log('🎨 Reto 7: Artefacto Creativo desmontado y recursos limpiados.');
  }
}