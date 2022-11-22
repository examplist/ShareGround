import { db, storage } from 'fb';
import { updateDoc, doc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import style from 'styles/components/Write.module.scss';

interface Props {
  data: DocumentData;
  articleid: string;
}

export default function Edit({ data, articleid }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const { category, title, explanation, fileRef } = data;
  const [fileName, setFileName] = useState<string>('파일을 새로 올리셔야 합니다.');
  const refFile = useRef<HTMLInputElement>(null);
  const refSubmit = useRef<HTMLInputElement>(null);

  const click$cancel = () => {
    router.push(`/article/${articleid}`);
  };
  const click$submit = () => {
    refSubmit.current?.click();
  };
  const click$file = () => {
    refFile.current?.click();
  };
  const change$file = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    // 업로드를 취소한 경우
    if (!event.target.files[0]) {
      setFileName('');
      return;
    }

    setFileName(event.target.files[0].name);
  };

  const submit$edit: SubmitHandler<FieldValues> = async ({
    category,
    title,
    explanation,
  }) => {
    setLoading(true);

    try {
      // 파일이 있으면 스토리지에 올리기
      // fileType은 바뀔 수 있으므로 data에서 가져오지 말고 여기서 지정
      let fileType = null;
      if (refFile.current?.files) {
        // 아무것도 안 올린 경우 스토리지에 올라가지 않게 하기
        if (refFile.current.files[0]) {
          const storageRef = ref(storage, `article-file/${fileRef}`);
          await uploadBytes(storageRef, refFile.current?.files[0]);
          fileType = refFile.current?.files[0].name.split('.').at(-1);
        }
      }
      // article 수정하기
      await updateDoc(doc(db, 'articles', articleid), {
        category,
        title,
        explanation,
        fileType,
      });
      // 이동하기
      router.push(`/article/${articleid}`);
    } catch (error) {
      console.error(error);
      alert('죄송합니다. 처리가 되지 않았습니다.');
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit$edit)} className={style['form']}>
        <section className={style['select']}>
          <label htmlFor="category">카테고리</label>
          <select id="category" {...register('category')} defaultValue={category}>
            <option value="society">사회</option>
            <option value="science">과학•기술</option>
            <option value="culture">문화</option>
          </select>
        </section>
        <input
          type={'text'}
          {...register('title')}
          defaultValue={title}
          className={style['title']}
        />
        <textarea
          {...register('explanation')}
          defaultValue={explanation}
          className={style['explanation']}
        ></textarea>
        <input type={'submit'} hidden ref={refSubmit} />
      </form>
      <section className={style['file']}>
        <input type={'file'} hidden onChange={change$file} ref={refFile} />
        <button onClick={click$file} disabled={loading}>
          파일 업로드
        </button>
        <div>업로드된 파일: {fileName}</div>
      </section>
      <section className={style['buttons']}>
        <button onClick={click$cancel} disabled={loading}>
          취소
        </button>
        <button onClick={click$submit} disabled={loading}>
          수정
        </button>
      </section>
    </>
  );
}
